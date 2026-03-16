import { FastifyPluginAsync } from 'fastify';
import * as SharedConstants from '@flowstate/shared/constants';

const { COLLECTIONS } = SharedConstants;

export const taskRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const taskDoc = await fastify.firestore.collection(COLLECTIONS.TASKS).doc(id).get();

    if (!taskDoc.exists) return reply.notFound('Task not found');

    const task: any = taskDoc.data();
    if (task.tenant_id !== request.user.tenant_id) return reply.forbidden('Access denied');

    return {
      success: true,
      data: {
        ...task,
        id: taskDoc.id,
        created_at: task.created_at?.toDate ? task.created_at.toDate().toISOString() : task.created_at,
        executed_at: task.executed_at?.toDate ? task.executed_at.toDate().toISOString() : task.executed_at,
      }
    };
  });
};
