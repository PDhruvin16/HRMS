import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, AuthUser, LoginResponseData } from '../../types/auth';

const initialState: AuthState = {
  access: null,
  refresh: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<LoginResponseData>) => {
      state.access = action.payload.accessToken;
      state.refresh = action.payload.refreshToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    logout: () => initialState,
  },
});

/**
 * Clears all persisted MMKV auth data and resets Redux state.
 * Call this instead of dispatching logout() directly.
 */
export const logoutAndClear = createAsyncThunk('auth/logoutAndClear', async (_, { dispatch }) => {
  const { default: storage } = await import('../../utils/Storage');
  storage.clearAuth();
  try {
    const { queryClient } = await import('../../hooks/useQueries');
    queryClient.clear();
  } catch (e) {
    console.warn('Failed to clear query client cache on logout:', e);
  }
  dispatch(authSlice.actions.logout());
});

export const { setCredentials, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer;
