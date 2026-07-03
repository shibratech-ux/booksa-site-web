import type { UserProfile } from '@/types/user.types';
import { api } from './api';

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
