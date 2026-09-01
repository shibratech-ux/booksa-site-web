import type { UserProfile } from '@/types/user.types';
import { api } from './api';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from './firebase';

const mockUsers: UserProfile[] = [
  {
    id: 'usr_101',
    name: 'Ava Thompson',
    email: 'ava.thompson@booksa.io',
    role: 'Gestionnaire de produit',
    status: 'active',
    department: 'Product',
    createdAt: '2026-05-12T09:20:00.000Z'
  },
  {
    id: 'usr_102',
    name: 'Noah Garcia',
    email: 'noah.garcia@booksa.io',
    role: 'Analyste financier',
    status: 'active',
    department: 'Finance',
    createdAt: '2026-05-14T11:35:00.000Z'
  },
  {
    id: 'usr_103',
    name: 'Mia Chen',
    email: 'mia.chen@booksa.io',
    role: 'Spécialiste support',
    status: 'invited',
    department: 'Operations',
    createdAt: '2026-05-21T14:05:00.000Z'
  }
];

export async function listUsers(): Promise<UserProfile[]> {
  if (import.meta.env.VITE_API_BASE_URL) {
    const response = await api.get<UserProfile[]>('/users');
    return response.data;
  }

  return mockUsers;
}

export async function updateLoggedInUserProfile(
  updates: Record<string, unknown>
): Promise<void> {
  const currentUser = firebaseAuth?.currentUser;

  if (!firebaseDb || !currentUser) {
    throw new Error('You must be signed in to update your account information.');
  }

  await updateDoc(doc(firebaseDb, 'users', currentUser.uid), {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

export async function getLoggedInUserProfile(): Promise<Record<string, unknown>> {
  const currentUser = firebaseAuth?.currentUser;

  if (!currentUser) {
    throw new Error('You must be signed in to view your account information.');
  }

  return getUserProfileById(currentUser.uid);
}

export async function getUserProfileById(userId: string): Promise<Record<string, unknown>> {
  const normalizedUserId = userId.trim();

  if (!firebaseDb || !normalizedUserId) {
    throw new Error('A valid user ID is required to view a user profile.');
  }

  const snapshot = await getDoc(doc(firebaseDb, 'users', normalizedUserId));

  if (!snapshot.exists()) {
    throw new Error(`The user profile for ${normalizedUserId} could not be found.`);
  }

  return snapshot.data();
}
