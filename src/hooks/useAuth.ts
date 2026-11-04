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
      const res = await authApi.login({ email, password });
      const payload = (res as any)?.data || res;
      const accessToken = payload?.accessToken || payload?.access || (res as any)?.accessToken;
      const refreshToken = payload?.refreshToken || payload?.refresh || (res as any)?.refreshToken;
      const user = payload?.user || (res as any)?.user;

      if (!accessToken) {
        throw new Error((res as any)?.message || 'Login failed: missing access token');
      }

      // Persist tokens synchronously in memory and asynchronously to storage
      await storage.setTokens({ accessToken, refreshToken });

      if (user) {
        await storage.setUser(user);
      }

      // Store permissions in Redux & Storage
      const permissions = user?.permissions || [];
      dispatch(setPermissions(permissions));
      try {
        await storage.setJSONAsync(StorageKeys.permissions, permissions);
      } catch (e) {
        console.warn('Failed to persist permissions:', e);
      }

      // Store in Redux (handles isAuthenticated flag)
      dispatch(
        setCredentials({
          accessToken,
          refreshToken: refreshToken || '',
          user: user || {},
        }),
      );
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
