import type { Firestore } from '@google-cloud/firestore';
import * as SharedConstants from '@flowstate/shared/constants';
import type { UserMemory } from '../agent/orchestrator.js';

const { COLLECTIONS } = SharedConstants;

export async function getUserMemory(firestore: Firestore, userId: string): Promise<UserMemory | undefined> {
  const doc = await firestore
    .collection(COLLECTIONS.USER_MEMORY)
    .doc(userId)
    .get();
  return doc.exists ? (doc.data() as UserMemory) : undefined;
}

export async function saveUserMemory(
  firestore: Firestore,
  userId: string,
  memory: Partial<UserMemory>,
): Promise<void> {
  await firestore
    .collection(COLLECTIONS.USER_MEMORY)
    .doc(userId)
    .set({ ...memory, updated_at: new Date() }, { merge: true });
}
