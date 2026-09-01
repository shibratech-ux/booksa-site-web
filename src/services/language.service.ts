import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { firebaseDb } from './firebase';
import { isSupportedLanguage, type SupportedLanguage } from '@/i18n/types';

export async function getUserLanguage(uid: string): Promise<SupportedLanguage | null> {
  if (!firebaseDb) return null;

  const snapshot = await getDoc(doc(firebaseDb, 'users', uid));
  if (!snapshot.exists()) return null;

  const language = snapshot.data().language;
  return isSupportedLanguage(language) ? language : null;
}

export async function updateUserLanguage(
  uid: string,
  language: SupportedLanguage
): Promise<'updated' | 'unchanged'> {
  if (!firebaseDb) throw new Error('Firestore is not configured.');

  const reference = doc(firebaseDb, 'users', uid);
  const snapshot = await getDoc(reference);

  if (!snapshot.exists()) {
    throw new Error('The user profile does not exist.');
  }
  if (snapshot.data().language === language) return 'unchanged';

  await updateDoc(reference, { language, updatedAt: serverTimestamp() });
  return 'updated';
}
