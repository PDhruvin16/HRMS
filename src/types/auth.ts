import { AppRole, Department } from '../constants/roles';

// ─── Request Types ───────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

// ─── Shared Models ───────────────────────────────────────────
export interface AuthUser {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  profileImage: string;
  roles: string[];
  employeeId?: string;
  permissions?: { resource: string; action: string }[];
  
  // Keep these for backward compatibility with existing code
  role?: AppRole; 
  first_name?: string;
  last_name?: string;
}

// ─── Response Types ───────────────────────────────────────────

/** Shape of `data` inside the login API response */
export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

/** Full login API response envelope */
export interface LoginResponse {
  success: boolean;
  message?: string;
  data: LoginResponseData;
  errors?: null | Record<string, unknown>;
}

// ─── Refresh Token Response ────────────────────────────────────
export interface RefreshTokenResponse {
  status: boolean;
  message: string;
  data: {
    access: string;
    refresh: string;
  };
  errors: null | any;
}

// ─── Redux State ──────────────────────────────────────────────
export interface AuthState {
  access: string | null;
  refresh: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
