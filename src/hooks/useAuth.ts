import {
  signIn,
  signInWithGoogle,
  signOutUser
} from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import type { AuthCredentials } from '@/types/auth.types';
import { ROUTES } from '@/utils/constants';
import { logFirebaseAuthError } from '@/utils/firebaseErrors';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const auth = useAuthStore();
  const navigate = useNavigate();

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
    navigate(ROUTES.home, { replace: true });
  };

  const loginWithGoogle = async () => {
    auth.setStatus('loading');

    try {
      const response = await signInWithGoogle();
      auth.setUser(response.user, response.token);
      return response;
    } catch (error) {
      auth.setStatus('anonymous');
      logFirebaseAuthError('Google sign-in failed:', error);
      throw error;
    }
  };

  return {
    ...auth,
    login,
    loginWithGoogle,
    logout,
    isLoggedIn: auth.isAuthenticated
  };
}
