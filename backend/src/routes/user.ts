import { FastifyPluginAsync } from 'fastify';
import * as SharedConstants from '@flowstate/shared/constants';
import type { TenantUsage } from '@flowstate/shared';

const { COLLECTIONS } = SharedConstants;

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/profile', async (request, reply) => {
    const userDoc = await fastify.firestore.collection(COLLECTIONS.USERS).doc(request.user.id).get();
    if (!userDoc.exists) {
      return reply.notFound('User not found');
    }
    const data = userDoc.data() as typeof request.user & { password_hash?: string };
    const { password_hash, ...safeUserData } = data;
    return { success: true, data: { ...safeUserData, id: userDoc.id } };
  });

  fastify.patch('/profile', async (request) => {
    const body = request.body as Record<string, any>;
    const updates: Record<string, unknown> = { updated_at: new Date() };

    const allowedFields = [
      'name', 'phone', 'linkedin', 'portfolio', 'location',
      'skills', 'resumeUrl', 'yearsOfExperience', 'preferredRole', 'coverLetterTemplate'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    await fastify.firestore.collection(COLLECTIONS.USERS).doc(request.user.id).update(updates);

    return { success: true, data: { ...request.user, ...updates } };
  });

  fastify.get('/usage', async (request) => {
    const tenantDoc = await fastify.firestore.collection(COLLECTIONS.TENANTS).doc(request.user.tenant_id).get();
    const tenant = tenantDoc.data() as { usage?: TenantUsage } | undefined;

    return {
      success: true,
      data: tenant?.usage || { tasks_this_month: 0, screenshots_stored: 0, last_reset_at: new Date() },
    };
  });
};
