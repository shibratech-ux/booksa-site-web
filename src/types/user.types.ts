export type UserStatus = 'active' | 'invited' | 'inactive';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  department: string;
  createdAt: string;
  avatarUrl?: string;
}
