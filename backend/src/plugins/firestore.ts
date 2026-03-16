import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { Firestore } from '@google-cloud/firestore';
import { config } from '../config/index.js';

declare module 'fastify' {
  interface FastifyInstance {
    firestore: Firestore;
  }
}

const firestorePluginCallback: FastifyPluginAsync = async (fastify) => {
  const options: any = {
    projectId: config.firebaseProjectId,
  };

  const credsPath = process.env['GOOGLE_APPLICATION_CREDENTIALS'];
  if (credsPath) {
    options.keyFilename = credsPath;
  }

  const firestore = new Firestore(options);

  fastify.decorate('firestore', firestore);

  fastify.addHook('onClose', async () => {
    await firestore.terminate();
  });
};

export const firestorePlugin = fp(firestorePluginCallback, {
  name: 'firestore',
});
