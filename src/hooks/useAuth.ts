import authApi from '../api/authApi';
import storage from '../utils/Storage';
import { AuthUser } from '../types/auth';
import { setCredentials, setLoading, setError, logoutAndClear } from '../store/slices/authSlice';
import { setPermissions } from '../store/slices/permissionSlice';
import { useMutation } from '@tanstack/react-query';
import { useAppDispatch, useAuthState } from './useRedux';

// ─── Hook ──────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const authState = useAuthState();

  const loginMutation = useMutation<
    void,
    Error,
    { email: string; password: string }
  >({
    onMutate: () => {
      dispatch(setLoading(true));
    },

    mutationFn: async ({ email, password }) => {
      const response = await authApi.login({ email, password });

      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }

      if (!response.data) {
        throw new Error('Login failed: empty response');
      }

      // Persist tokens in MMKV/AsyncStorage for axios interceptor
      storage.setTokens({ accessToken: response.data.accessToken, refreshToken: response.data.refreshToken });

      // Store permissions in Redux
      if (response.data.user && response.data.user.permissions) {
        dispatch(setPermissions(response.data.user.permissions));
      } else {
        dispatch(setPermissions([]));
      }

      // Store in Redux (handles isAuthenticated flag)
      dispatch(setCredentials(response.data));
    },

    onError: (error: Error) => {
      dispatch(setError(error.message || 'Login failed'));
    },
  });

  return {
    isAuthenticated: authState.isAuthenticated ?? false,
    user: authState.user as AuthUser | null,
    access: authState.access,
    isLoading: authState.isLoading || loginMutation.isPending,
    error: authState.error ?? null,
    login: (credentials: { email: string; password: string }) =>
      loginMutation.mutateAsync(credentials),
    logout: () => {
      dispatch(logoutAndClear());
    },
    clearError: () => dispatch(setError(null)),
  };
};

export const useAuthStatus = () => {
  const { isAuthenticated, isLoading } = useAuthState();
  return { isAuthenticated: isAuthenticated ?? false, isLoading: isLoading ?? false };
};
