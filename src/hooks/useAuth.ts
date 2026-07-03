import { signIn, signOutUser } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import type { AuthCredentials } from '@/types/auth.types';

export function useAuth() {
  const auth = useAuthStore();

  const login = async (credentials: AuthCredentials) => {
    auth.setStatus('loading');

    try {
      const response = await signIn(credentials);
      auth.setUser(response.user, response.token);
      return response;
    } catch (error) {
      auth.setStatus('anonymous');
      throw error;
    }
  };

  const logout = async () => {
    await signOutUser();
    auth.clearUser();
    auth.setStatus('anonymous');
  };

  return {
    ...auth,
    login,
    logout,
    isLoggedIn: auth.isAuthenticated
  };
}
