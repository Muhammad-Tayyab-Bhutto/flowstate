import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import type { Session, PlanType } from '@flowstate/shared';
import * as SharedConstants from '@flowstate/shared/constants';

const { COLLECTIONS, PLAN_FEATURES } = SharedConstants;

const CreateSessionSchema = z.object({
  goal: z.string().min(5).max(500),
  options: z.object({
    max_actions: z.number().min(1).max(100).default(50),
    timeout_minutes: z.number().min(1).max(30).default(10),
    initial_url: z.string().url().optional(),
  }).optional(),
});

const UpdateSessionSchema = z.object({
  status: z.enum(['PAUSED', 'ACTIVE']),
});

export const sessionRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  // List sessions
  fastify.get('/', async (request) => {
    const { page = '1', limit = '20' } = request.query as { page?: string; limit?: string };
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100);

    const sessionsRef = fastify.firestore
      .collection(COLLECTIONS.SESSIONS)
      .where('tenant_id', '==', request.user.tenant_id)
      .orderBy('started_at', 'desc')
      .limit(limitNum + 1)
      .offset((pageNum - 1) * limitNum);

    const snapshot = await sessionsRef.get();
    const sessions = snapshot.docs.slice(0, limitNum).map((doc) => {
      const data: any = doc.data();
      return {
        ...data,
        id: doc.id,
        started_at: data.started_at?.toDate ? data.started_at.toDate().toISOString() : data.started_at,
        ended_at: data.ended_at?.toDate ? data.ended_at.toDate().toISOString() : data.ended_at,
      };
    });
    const hasMore = snapshot.docs.length > limitNum;

    return { success: true, data: sessions, pagination: { page: pageNum, limit: limitNum, has_more: hasMore } };
  });

  // Get session by ID
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const sessionDoc = await fastify.firestore.collection(COLLECTIONS.SESSIONS).doc(id).get();

    if (!sessionDoc.exists) return reply.notFound('Session not found');

    const sessionData = sessionDoc.data() as any;
    if (sessionData.tenant_id !== request.user.tenant_id) return reply.forbidden('Access denied');

    const session: any = { ...sessionData, id: sessionDoc.id };
    if (session.started_at?.toDate) session.started_at = session.started_at.toDate().toISOString();
    if (session.ended_at?.toDate) session.ended_at = session.ended_at.toDate().toISOString();

    return { success: true, data: session };
  });

  // Create session
  fastify.post('/', async (request, reply) => {
    const body = CreateSessionSchema.parse(request.body);

    const tenantDoc = await fastify.firestore.collection(COLLECTIONS.TENANTS).doc(request.user.tenant_id).get();
    const tenant = tenantDoc.data() as { plan?: PlanType; usage?: { tasks_this_month?: number } } | undefined;
    const plan = tenant?.plan || 'FREE';
    const planLimits = PLAN_FEATURES[plan];

    if (planLimits.tasks_per_month !== -1 && (tenant?.usage?.tasks_this_month ?? 0) >= planLimits.tasks_per_month) {
      return reply.paymentRequired('Monthly task limit reached');
    }

    const activeSessions = await fastify.firestore
      .collection(COLLECTIONS.SESSIONS)
      .where('tenant_id', '==', request.user.tenant_id)
      .where('status', '==', 'ACTIVE')
      .get();

    if (planLimits.concurrent_sessions !== -1 && activeSessions.size >= planLimits.concurrent_sessions) {
      return reply.conflict('Concurrent session limit reached');
    }

    const sessionId = nanoid();
    const now = new Date();

    const session: Omit<Session, 'id'> = {
      tenant_id: request.user.tenant_id,
      user_id: request.user.id,
      status: 'ACTIVE',
      goal: body.goal,
      started_at: now,
      ended_at: null,
      total_actions: 0,
      successful_actions: 0,
      failed_actions: 0,
      metadata: {
        browser: 'chromium',
        resolution: '1920x1080',
        user_agent: request.headers['user-agent'] || 'unknown',
        ...(body.options?.initial_url ? { initial_url: body.options.initial_url } : {}),
      },
    };

    await fastify.firestore.collection(COLLECTIONS.SESSIONS).doc(sessionId).set(session);

    return { success: true, data: { ...session, id: sessionId } };
  });

  // Update session
  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = UpdateSessionSchema.parse(request.body);

    const sessionRef = fastify.firestore.collection(COLLECTIONS.SESSIONS).doc(id);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) return reply.notFound('Session not found');

    const session = sessionDoc.data() as Session;
    if (session.tenant_id !== request.user.tenant_id) return reply.forbidden('Access denied');
    if (session.status === 'COMPLETED' || session.status === 'FAILED') {
      return reply.conflict('Cannot modify completed or failed session');
    }

    await sessionRef.update({ status: body.status });

    return { success: true, data: { ...session, id, status: body.status } };
  });

  // Cancel session
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const sessionRef = fastify.firestore.collection(COLLECTIONS.SESSIONS).doc(id);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) return reply.notFound('Session not found');

    const session = sessionDoc.data() as Session;
    if (session.tenant_id !== request.user.tenant_id) return reply.forbidden('Access denied');

    await sessionRef.update({ status: 'CANCELED', ended_at: new Date() });

    return { success: true, message: 'Session canceled' };
  });

  // Get tasks for session
  fastify.get('/:id/tasks', async (request, reply) => {
    const { id } = request.params as { id: string };

    const sessionDoc = await fastify.firestore.collection(COLLECTIONS.SESSIONS).doc(id).get();
    if (!sessionDoc.exists) return reply.notFound('Session not found');

    const session = sessionDoc.data() as Session;
    if (session.tenant_id !== request.user.tenant_id) return reply.forbidden('Access denied');

    const tasksSnapshot = await fastify.firestore
      .collection(COLLECTIONS.TASKS)
      .where('session_id', '==', id)
      .orderBy('created_at', 'asc')
      .get();

    const tasks = tasksSnapshot.docs.map((doc) => {
      const data: any = doc.data();
      return {
        ...data,
        id: doc.id,
        created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : data.created_at,
        executed_at: data.executed_at?.toDate ? data.executed_at.toDate().toISOString() : data.executed_at,
      };
    });

    return { success: true, data: tasks };
  });
};
