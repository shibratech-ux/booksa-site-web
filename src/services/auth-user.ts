import type { User } from 'firebase/auth';
import type { AuthResponse, AuthRole } from '@/types/auth.types';

const AUTH_ROLES: ReadonlySet<AuthRole> = new Set([
  'user',
  'admin',
  'manager',
  'analyst',
  'support'
]);

function getTrustedRole(roleClaim: unknown): AuthRole {
  return typeof roleClaim === 'string' && AUTH_ROLES.has(roleClaim as AuthRole)
    ? (roleClaim as AuthRole)
    : 'user';
}

export async function createAuthResponse(
  user: User,
  fallbackEmail = ''
): Promise<AuthResponse> {
  const idTokenResult = await user.getIdTokenResult();

  return {
    user: {
      id: user.uid,
      name: user.displayName ?? 'Utilisateur Booksa',
      email: user.email ?? fallbackEmail,
      role: getTrustedRole(idTokenResult.claims.role),
      avatarUrl: user.photoURL ?? undefined
    },
    token: idTokenResult.token
  };
}
