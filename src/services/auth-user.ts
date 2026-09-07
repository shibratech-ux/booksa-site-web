import type { User } from 'firebase/auth';
import type { AuthResponse, AuthRole } from '@/types/auth.types';
import { getUserProfileById } from './user.service';

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
  // Profile availability must not invalidate an otherwise valid Firebase session.
  const profile = await getUserProfileById(user.uid).catch(() => ({} as Record<string, unknown>));
  const profileString = (...keys: string[]) => keys.map((key) => profile[key])
    .find((value): value is string => typeof value === 'string' && value.trim().length > 0)?.trim();
  const profileName = profileString('name', 'displayName', 'fullName') ||
    [profileString('firstName'), profileString('lastName')].filter(Boolean).join(' ');

  return {
    user: {
      id: user.uid,
      name: profileName || user.displayName || 'Utilisateur Booksa',
      email: user.email ?? fallbackEmail,
      role: getTrustedRole(idTokenResult.claims.role),
      avatarUrl: profileString('avatarUrl', 'photoURL', 'photoUrl') || user.photoURL || undefined
    },
    token: idTokenResult.token
  };
}
