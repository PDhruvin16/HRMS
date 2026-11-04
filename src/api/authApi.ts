import { AuthClient, ApiClient } from '../services/apiClients';
import { API_ENDPOINTS } from './endpoints';
import { AxiosRequestConfig } from 'axios';
import { LoginRequest, LoginResponse, RefreshTokenResponse } from '../types/auth';

export type ChangePasswordPayload = {
  old_password: string;
  new_password: string;
  confirm_password: string;
};

/**
 * Classic Axios-based API calls
 */
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await AuthClient.post<any>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response;
  },

  refreshToken: async (refreshToken: string): Promise<any> => {
    const response = await AuthClient.post<any>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      refreshToken: refreshToken,
      refresh: refreshToken,
      refresh_token: refreshToken,
    });
    return response;
  },

  changePassword: async (
    payload: ChangePasswordPayload,
    token?: string,
  ): Promise<{
    status: boolean;
    error?: number;
    data?: { access_token?: string; refresh_token?: string };
    message?: string;
  }> => {
    const config: AxiosRequestConfig = {};
    if (token) {
      config.headers = { Authorization: `Bearer ${token}` } as Record<string, string>;
    }
    const response = await ApiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD.BASE, payload, config);
    return response;
  },

  fetchPreviewToken: async (): Promise<any> => {
    const response = await ApiClient.get<any>('/core/tenant/get_media_url_token/');
    return response;
  },
};

export default authApi;
