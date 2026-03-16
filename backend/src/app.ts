import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import websocket from '@fastify/websocket';
import cookie from '@fastify/cookie';
import sensible from '@fastify/sensible';

import { config } from './config/index.js';
import { firestorePlugin } from './plugins/firestore.js';
import { authPlugin } from './plugins/auth.js';

import { authRoutes } from './routes/auth.js';
import { sessionRoutes } from './routes/sessions.js';
import { taskRoutes } from './routes/tasks.js';
import { billingRoutes } from './routes/billing.js';
import { userRoutes } from './routes/user.js';
import { agentRoutes } from './routes/agent.js';
import { jobRoutes } from './routes/jobs.js';
import { healthRoutes } from './routes/health.js';

const app = Fastify({
  logger: {
    level: config.logLevel,
    transport: config.nodeEnv === 'development' ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
  },
});

async function bootstrap() {
  await app.register(cors, { origin: config.corsOrigin, credentials: true });
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cookie, { secret: config.cookieSecret });
  await app.register(jwt, { secret: config.jwtSecret, sign: { expiresIn: config.jwtExpiresIn } });
  await app.register(rateLimit, { global: true, max: 100, timeWindow: '1 minute' });
  await app.register(sensible);
  await app.register(websocket);

  await app.register(firestorePlugin);
  await app.register(authPlugin);

  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  await app.register(sessionRoutes, { prefix: '/api/v1/sessions' });
  await app.register(taskRoutes, { prefix: '/api/v1/tasks' });
  await app.register(billingRoutes, { prefix: '/api/v1/billing' });
  await app.register(userRoutes, { prefix: '/api/v1/user' });
  await app.register(agentRoutes, { prefix: '/api/v1/agent' });
  await app.register(jobRoutes, { prefix: '/api/v1/jobs' });

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    const statusCode = error.statusCode || 500;
    reply.status(statusCode).send({
      success: false,
      error: { code: error.code || 'INTERNAL_ERROR', message: statusCode === 500 ? 'Internal Server Error' : error.message },
    });
  });

  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
    app.log.info(`Server running on port ${config.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap();

export { app };
