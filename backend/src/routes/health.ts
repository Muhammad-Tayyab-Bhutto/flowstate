import { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async () => {
    return { status: 'healthy', timestamp: new Date().toISOString(), version: '1.0.0' };
  });

  fastify.get('/ready', async (_request, reply) => {
    try {
      await fastify.firestore.collection('_health').limit(1).get();
      return { status: 'ready', checks: { firestore: 'connected' } };
    } catch {
      return reply.serviceUnavailable('Service not ready');
    }
  });
};
