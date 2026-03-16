import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import type { User } from '@flowstate/shared';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    user: User;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      id: string;
      email: string;
      tenant_id: string;
      role: string;
      type?: string;
    };
    user: User;
  }
}

const authPluginCallback: FastifyPluginAsync = async (fastify) => {
  fastify.decorate(
    'authenticate',
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();

        // Fetch full user from Firestore
        const userDoc = await fastify.firestore
          .collection('users')
          .doc(request.user.id)
          .get();

        if (!userDoc.exists) {
          return reply.unauthorized('User not found');
        }

        const data = userDoc.data() as User & { password_hash?: string };
        const { password_hash, ...safeUserData } = data;
        request.user = { ...safeUserData, id: userDoc.id } as User;
      } catch {
        return reply.unauthorized('Invalid or expired token');
      }
    }
  );
};

export const authPlugin = fp(authPluginCallback, {
  name: 'auth',
  dependencies: ['@fastify/jwt', 'firestore'],
});
