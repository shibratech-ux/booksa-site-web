export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'analyst' | 'support';
  avatarUrl?: string;
  token?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'authenticated' | 'anonymous';
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}
