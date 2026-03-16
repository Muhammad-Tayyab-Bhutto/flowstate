import Fastify from 'fastify';
import cors from '@fastify/cors';
import { BrowserManager } from './browser.js';
import { executeAction, type ActionRequest } from './actions.js';

const PORT = parseInt(process.env['PORT'] || '3002', 10);

const app = Fastify({
  logger: {
    level: process.env['LOG_LEVEL'] || 'info',
    transport: process.env['NODE_ENV'] === 'development' ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
  },
});

const browserManager = new BrowserManager();

// Track active SSE streaming clients per session: session_id -> set of reply objects
const streamClients = new Map<string, Set<any>>();

async function bootstrap() {
  await app.register(cors, { origin: '*' });

  app.get('/health', async () => ({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    activeSessions: browserManager.getActiveSessionCount(),
  }));

  app.post<{ Body: { session_id: string; initial_url?: string } }>('/session/start', async (request, reply) => {
    const { session_id, initial_url } = request.body;
    try {
      await browserManager.createSession(session_id, initial_url);
      return { success: true, session_id };
    } catch (error) {
      app.log.error({ error }, 'Failed to start session');
      return reply.status(500).send({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post<{ Body: { session_id: string } }>('/session/close', async (request, reply) => {
    const { session_id } = request.body;
    try {
      await browserManager.closeSession(session_id);
      // Close all SSE clients for this session
      const clients = streamClients.get(session_id);
      if (clients) {
        clients.forEach(r => { try { r.raw.end(); } catch { } });
        streamClients.delete(session_id);
      }
      return { success: true };
    } catch (error) {
      app.log.error({ error }, 'Failed to close session');
      return reply.status(500).send({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post<{ Body: { session_id: string } }>('/screenshot', async (request, reply) => {
    const { session_id } = request.body;
    const page = browserManager.getPage(session_id);
    if (!page) return reply.status(404).send({ success: false, error: 'Session not found' });

    try {
      const screenshot = await page.screenshot({ type: 'png', fullPage: false });
      return { success: true, screenshot: screenshot.toString('base64') };
    } catch (error) {
      app.log.error({ error }, 'Failed to take screenshot');
      return reply.status(500).send({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post<{ Body: ActionRequest }>('/execute', async (request, reply) => {
    const { session_id, action, target } = request.body;
    const page = browserManager.getPage(session_id);
    if (!page) return reply.status(404).send({ success: false, error: 'Session not found' });

    try {
      const result = await executeAction(page, action, target);
      let screenshot: string | undefined;
      try { screenshot = (await page.screenshot({ type: 'png' })).toString('base64'); } catch { /* ignore */ }
      return { success: result.success, error: result.error, screenshot };
    } catch (error) {
      app.log.error({ error }, 'Failed to execute action');
      return reply.status(500).send({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post<{ Body: { session_id: string } }>('/url', async (request, reply) => {
    const page = browserManager.getPage(request.body.session_id);
    if (!page) return reply.status(404).send({ success: false, error: 'Session not found' });
    return { success: true, url: page.url() };
  });

  // ====================================================================
  // USER INPUT FORWARDING — routes user mouse/keyboard from browser panel
  // ====================================================================
  app.post<{
    Body: {
      session_id: string;
      type: 'click' | 'move' | 'keydown' | 'scroll';
      nx?: number;   // Normalized X (0-1)
      ny?: number;   // Normalized Y (0-1)
      button?: 'left' | 'right' | 'middle';
      key?: string;
      deltaY?: number;
    }
  }>('/input', async (request, reply) => {
    const { session_id, type, nx, ny, button, key, deltaY } = request.body;
    const page = browserManager.getPage(session_id);
    if (!page) return reply.status(404).send({ success: false, error: 'Session not found' });

    try {
      const viewport = page.viewportSize() ?? { width: 1920, height: 1080 };
      const x = (nx ?? 0) * viewport.width;
      const y = (ny ?? 0) * viewport.height;

      if (type === 'click') {
        await page.mouse.click(x, y, { button: button ?? 'left' });
      } else if (type === 'move') {
        await page.mouse.move(x, y);
      } else if (type === 'keydown' && key) {
        await page.keyboard.press(key);
      } else if (type === 'scroll') {
        await page.mouse.wheel(0, deltaY ?? 100);
      }

      return { success: true };
    } catch (error) {
      return reply.status(500).send({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // ====================================================================
  // LIVE SCREEN via SSE — streams base64 JPEG frames ~10fps
  // Frontend connects via EventSource to get continuous frame updates
  // ====================================================================
  app.get<{ Params: { session_id: string } }>('/stream/:session_id', async (request, reply) => {
    const { session_id } = request.params;

    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('Access-Control-Allow-Origin', '*');
    reply.raw.flushHeaders();

    // Track this client
    if (!streamClients.has(session_id)) {
      streamClients.set(session_id, new Set());
    }
    streamClients.get(session_id)!.add(reply);

    const sendFrame = async () => {
      if (reply.raw.destroyed) {
        clearInterval(interval);
        streamClients.get(session_id)?.delete(reply);
        return;
      }
      const page = browserManager.getPage(session_id);
      if (!page) return;
      try {
        const frame = await page.screenshot({ type: 'jpeg', quality: 65, fullPage: false });
        const b64 = frame.toString('base64');
        reply.raw.write(`data: ${b64}\n\n`);
      } catch { /* ignore transient errors */ }
    };

    sendFrame();
    const interval = setInterval(sendFrame, 100); // ~10fps

    request.raw.on('close', () => {
      clearInterval(interval);
      streamClients.get(session_id)?.delete(reply);
    });

    // Keep the reply open
    await new Promise<void>((resolve) => {
      request.raw.on('close', resolve);
    });
  });

  const shutdown = async () => {
    app.log.info('Shutting down...');
    streamClients.forEach((clients) => clients.forEach(r => { try { r.raw.end(); } catch { } }));
    streamClients.clear();
    await browserManager.closeAll();
    await app.close();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    app.log.info(`Playwright service running on port ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap();
