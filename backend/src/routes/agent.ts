import { FastifyPluginAsync } from 'fastify';
import { WebSocket } from 'ws';
import type { Session, WebSocketEvent } from '@flowstate/shared';
import * as SharedConstants from '@flowstate/shared/constants';
import { AgentOrchestrator } from '../agent/index.js';
import { getUserMemory } from '../services/userMemory.js';

const { COLLECTIONS, WS_EVENTS } = SharedConstants;

interface ClientMessage {
  type: string;
  session_id?: string;
  data?: unknown;
}

/** Running orchestrators keyed by session ID */
const activeOrchestrators = new Map<string, AgentOrchestrator>();

function send(socket: WebSocket, event: WebSocketEvent): void {
  try {
    socket.send(JSON.stringify(event));
  } catch (err) {
    // Client may have disconnected
  }
}

export const agentRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/stream', { websocket: true }, async (connection) => {
    const socket = connection.socket as WebSocket;
    let currentSessionId: string | null = null;
    let userId: string | null = null;
    let tenantId: string | null = null;

    socket.on('message', async (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString()) as ClientMessage;

        if (!userId && data.type === 'auth') {
          try {
            const decoded = fastify.jwt.verify<{ id: string; tenant_id: string }>(data.data as string);
            userId = decoded.id;
            tenantId = decoded.tenant_id;
            socket.send(JSON.stringify({ type: 'authenticated' }));
          } catch {
            socket.send(JSON.stringify({ type: 'error', data: { message: 'Invalid token' } }));
          }
          return;
        }

        if (!userId || !tenantId) {
          socket.send(JSON.stringify({ type: 'error', data: { message: 'Not authenticated' } }));
          return;
        }

        switch (data.type) {
          case WS_EVENTS.CLIENT.START_SESSION: {
            const sessionId = data.session_id;
            if (!sessionId) {
              socket.send(JSON.stringify({ type: 'error', data: { message: 'Session ID required' } }));
              return;
            }

            if (activeOrchestrators.has(sessionId)) {
              fastify.log.info(`Session ${sessionId} already running, ignoring duplicate start request`);
              return;
            }

            // Sync lock to prevent async race conditions with React StrictMode double mounts
            activeOrchestrators.set(sessionId, 'starting' as any);

            const sessionDoc = await fastify.firestore.collection(COLLECTIONS.SESSIONS).doc(sessionId).get();
            if (!sessionDoc.exists) {
              activeOrchestrators.delete(sessionId);
              socket.send(JSON.stringify({ type: 'error', data: { message: 'Session not found' } }));
              return;
            }

            const session = { ...sessionDoc.data(), id: sessionDoc.id } as Session;
            if (session.tenant_id !== tenantId) {
              activeOrchestrators.delete(sessionId);
              socket.send(JSON.stringify({ type: 'error', data: { message: 'Access denied' } }));
              return;
            }

            if (session.status !== 'ACTIVE') {
              activeOrchestrators.delete(sessionId);
              socket.send(JSON.stringify({ type: 'error', data: { message: 'Session is not active' } }));
              return;
            }

            currentSessionId = sessionId;

            let userMemory = await getUserMemory(fastify.firestore, userId) || {};
            const userDoc = await fastify.firestore.collection(COLLECTIONS.USERS).doc(userId).get();
            if (userDoc.exists) {
              userMemory.profile = userDoc.data() as any;
            }

            const callbacks = {
              onTaskStarted: (e: WebSocketEvent) => send(socket, e),
              onTaskCompleted: (e: WebSocketEvent) => send(socket, e),
              onTaskFailed: (e: WebSocketEvent) => send(socket, e),
              onPerceptionUpdate: (e: WebSocketEvent) => send(socket, e),
              onUserPrompt: (e: WebSocketEvent) => send(socket, e),
              onSessionCompleted: (e: WebSocketEvent) => {
                send(socket, e);
                activeOrchestrators.delete(sessionId);
                currentSessionId = null;
              },
              onSessionFailed: (e: WebSocketEvent) => {
                send(socket, e);
                activeOrchestrators.delete(sessionId);
                currentSessionId = null;
              },
              onAgentThought: (e: WebSocketEvent) => send(socket, e),
              onError: (e: WebSocketEvent) => send(socket, e),
            };

            const orchestrator = new AgentOrchestrator(session, callbacks, userMemory);
            activeOrchestrators.set(sessionId, orchestrator);

            send(socket, {
              type: 'session:started',
              session_id: sessionId,
              timestamp: new Date(),
              data: { message: 'Agent started — real-time perception & execution loop active' },
            } as WebSocketEvent);

            orchestrator.run().catch(async (err) => {
              fastify.log.error({ err, sessionId }, 'Orchestrator run error');

              try {
                await fastify.firestore.collection(COLLECTIONS.SESSIONS).doc(sessionId).update({
                  status: 'FAILED',
                  ended_at: new Date()
                });
              } catch (dbErr) {
                fastify.log.error({ dbErr, sessionId }, 'Failed to update session status to FAILED');
              }

              send(socket, {
                type: 'session:failed',
                session_id: sessionId,
                timestamp: new Date(),
                data: { error: err instanceof Error ? err.message : 'Unknown error' },
              } as WebSocketEvent);
              activeOrchestrators.delete(sessionId);
              currentSessionId = null;
            });
            break;
          }

          case WS_EVENTS.CLIENT.RECONNECT_SESSION: {
            if (currentSessionId && activeOrchestrators.has(currentSessionId)) {
              send(socket, {
                type: 'session:started',
                session_id: currentSessionId,
                timestamp: new Date(),
                data: { message: 'Reconnected to active session' },
              } as WebSocketEvent);
            } else {
              socket.send(JSON.stringify({ type: 'error', data: { message: 'Session not active' } }));
            }
            break;
          }

          case WS_EVENTS.CLIENT.PAUSE_SESSION: {
            if (currentSessionId) {
              const orch = activeOrchestrators.get(currentSessionId);
              if (orch && typeof orch !== 'string') {
                orch.pause();
                send(socket, { type: WS_EVENTS.SERVER.SESSION_PAUSED, session_id: currentSessionId, timestamp: new Date(), data: {} } as WebSocketEvent);
              } else {
                await fastify.firestore.collection(COLLECTIONS.SESSIONS).doc(currentSessionId).update({ status: 'PAUSED' });
                send(socket, { type: WS_EVENTS.SERVER.SESSION_PAUSED, session_id: currentSessionId, timestamp: new Date(), data: {} } as WebSocketEvent);
              }
            }
            break;
          }

          case WS_EVENTS.CLIENT.RESUME_SESSION: {
            if (currentSessionId) {
              const orch = activeOrchestrators.get(currentSessionId);
              if (orch && typeof orch !== 'string') {
                orch.resume();
                send(socket, { type: WS_EVENTS.SERVER.SESSION_RESUMED, session_id: currentSessionId, timestamp: new Date(), data: {} } as WebSocketEvent);
              } else {
                await fastify.firestore.collection(COLLECTIONS.SESSIONS).doc(currentSessionId).update({ status: 'ACTIVE' });
                send(socket, { type: WS_EVENTS.SERVER.SESSION_RESUMED, session_id: currentSessionId, timestamp: new Date(), data: {} } as WebSocketEvent);
              }
            }
            break;
          }

          case WS_EVENTS.CLIENT.CANCEL_SESSION: {
            if (currentSessionId) {
              const orch = activeOrchestrators.get(currentSessionId);
              if (orch && typeof orch !== 'string') {
                orch.cancel();
              }
              await fastify.firestore.collection(COLLECTIONS.SESSIONS).doc(currentSessionId).update({ status: 'CANCELED', ended_at: new Date() });
              send(socket, { type: WS_EVENTS.SERVER.SESSION_COMPLETED, session_id: currentSessionId, timestamp: new Date(), data: { reason: 'canceled' } } as WebSocketEvent);
              if (orch && typeof orch === 'string') {
                activeOrchestrators.delete(currentSessionId);
              } else if (orch) {
                activeOrchestrators.delete(currentSessionId);
              }
              currentSessionId = null;
            }
            break;
          }

          case WS_EVENTS.CLIENT.USER_RESPONSE:
          case WS_EVENTS.CLIENT.VOICE_COMMAND: {
            const orch = currentSessionId ? activeOrchestrators.get(currentSessionId) : null;
            const text = typeof data.data === 'string' ? data.data : (data.data as { text?: string })?.text ?? '';
            if (orch && typeof orch !== 'string' && text.trim()) {
              orch.setUserInterruption(text.trim());
              // Auto-resume the agent if it was paused waiting for user input
              orch.resume();
              fastify.log.info('User interruption applied and agent resumed: %s', text);
            }
            break;
          }

          case 'client:save_profile_field': {
            // User wants to persist a field value to their profile (extra_fields map)
            const { field_key, value, label } = (data.data ?? {}) as { field_key?: string; value?: string; label?: string };
            if (!field_key || !value || !userId) break;
            try {
              await fastify.firestore.collection(COLLECTIONS.USERS).doc(userId).update({
                [`extra_fields.${field_key}`]: value,
              });
              fastify.log.info('Profile field saved: %s = %s (user: %s)', field_key, value, userId);
              socket.send(JSON.stringify({
                type: 'field_saved',
                data: { field_key, value, label: label ?? field_key, message: `"${label ?? field_key}" saved to your profile.` }
              }));
            } catch (err) {
              fastify.log.error({ err }, 'Failed to save profile field');
            }
            break;
          }
        }
      } catch (error) {
        fastify.log.error({ error }, 'WebSocket message error');
        socket.send(JSON.stringify({ type: 'error', data: { message: 'Invalid message format' } }));
      }
    });

    socket.on('close', () => {
      fastify.log.info('WebSocket connection closed');
      // Optionally cancel session on disconnect - for now we leave it running
    });
    socket.on('error', (error) => fastify.log.error({ error }, 'WebSocket error'));
  });
};
