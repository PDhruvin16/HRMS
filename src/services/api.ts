import { InternalAxiosRequestConfig } from 'axios';
import storage from '../utils/Storage';
import log from '../utils/Logger';
import authApi from '../api/authApi';
import { ApiClient, AuthClient, BASE_URL } from './apiClients';
import moment from 'moment';

export { BASE_URL };

export let serverClockOffset = 0;

export const getServerTime = () => {
  return Date.now() + serverClockOffset;
};

export const getServerMoment = () => {
  return moment(getServerTime());
};

export interface ApiResponse<T> {
  status: boolean;
  error: number;
  data: T;
  message: string;
}

export interface AppAxiosRequestConfig {
  isMultipart?: boolean;
  _retry?: boolean;
  isRefreshRequest?: boolean;
  _retryCount?: number;
  [key: string]: unknown;
}

interface ReactNativeFile {
  uri: string;
  name: string;
  type: string;
}

interface AxiosErrorLike {
  config?: CustomAxiosRequestConfig;
  code?: string;
  message?: string;
  response?: {
    status: number;
    data?: {
      message?: string;
      [key: string]: unknown;
    };
  };
}

interface ReactNativeFormData extends FormData {
  _parts?: [string, string | number | boolean | ReactNativeFile][];
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  isMultipart?: boolean;
  _retry?: boolean;
  isRefreshRequest?: boolean;
  _retryCount?: number;
}

function isReactNativeFormData(data: unknown): data is ReactNativeFormData {
  return (
    typeof data === 'object' &&
    data !== null &&
    '_parts' in data &&
    Array.isArray((data as { _parts?: unknown })._parts)
  );
}

function generateCurl(config: CustomAxiosRequestConfig) {
  let curl = [`curl -X ${config.method?.toUpperCase() || 'GET'}`];
  const fullUrl = config.baseURL ? `${config.baseURL.replace(/\/$/, '')}${config.url}` : config.url;
  curl.push(`"${fullUrl}"`);

  if (config.headers) {
    const isFormData = config.data instanceof FormData;
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    for (let key in config.headers) {
      if (config.headers.hasOwnProperty(key)) {
        if (isFormData && key.toLowerCase() === 'content-type') continue;
        const value = sensitiveHeaders.includes(key.toLowerCase())
          ? '[REDACTED]'
          : config.headers[key];
        curl.push(`-H "${key}: ${value}"`);
      }
    }
  }

  if (config.data) {
    try {
      const data = config.data;
      if (data instanceof FormData) {
        if (isReactNativeFormData(data)) {
          data._parts!.forEach(([fieldName, fieldValue]) => {
            if (typeof fieldValue === 'object' && fieldValue !== null && 'uri' in fieldValue) {
              const file = fieldValue as ReactNativeFile;
              curl.push(`-F "${fieldName}=@${file.name};type=${file.type}"`);
            } else {
              curl.push(`-F "${fieldName}=${String(fieldValue)}"`);
            }
          });
        } else {
          curl.push('# FormData body present (unable to introspect fields safely)');
        }
      } else if (typeof data === 'string') {
        try {
          curl.push(`-d '${JSON.stringify(JSON.parse(data))}'`);
        } catch {
          curl.push(`-d '${data}'`);
        }
      } else if (typeof data === 'object') {
        curl.push(`-d '${JSON.stringify(data)}'`);
      }
    } catch (err) {
      log.warn('Could not serialize request data for cURL:', err);
    }
  }

  return curl.join(' \\\n  ');
}

const axiosClient = ApiClient;

// ─── Request Interceptor ─────────────────────────────────────────────────────
// ApiClient always adds Authorization — public calls should use AuthClient
axiosClient.interceptors.request.use(
  async (config: CustomAxiosRequestConfig) => {
    const token = storage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers['x-type'] = 'mobile';

    // Handle multipart/form-data
    if (config.data instanceof FormData) {
      config.isMultipart = true;
      config.headers['Content-Type'] = 'multipart/form-data';
    } else if (config.isMultipart) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }

    if (__DEV__) {
      log.debug('🚀 Request:', generateCurl(config));
      log.debug('📤 Config:', {
        method: config.method,
        url: config.url,
        baseURL: config.baseURL,
        headers: { ...config.headers, Authorization: config.headers.Authorization ?? undefined },
        data:
          config.data instanceof FormData
            ? `FormData with ${(config.data as ReactNativeFormData)._parts?.length || 0} parts`
            : config.data,
        isMultipart: config.isMultipart,
      });
    }

    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// ─── AuthClient Interceptor (Logging Only) ───────────────────────────────────
AuthClient.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    config.headers['x-type'] = 'mobile';
    if (__DEV__) {
      log.debug('🚀 Auth Request:', generateCurl(config));
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

AuthClient.interceptors.response.use(
  (response) => {
    const serverDateHeader = response.headers && response.headers['date'];
    if (serverDateHeader) {
      const serverMs = new Date(serverDateHeader).getTime();
      const clientMs = Date.now();
      serverClockOffset = serverMs - clientMs;
    }
    if (__DEV__) {
      log.debug('✅ Auth Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    return response.data;
  },
  (error: unknown) => {
    const axiosError = error as AxiosErrorLike;
    if (__DEV__) {
      log.debug('❌ Auth Error:', {
        status: axiosError.response?.status,
        url: axiosError.config?.url,
        data: axiosError.response?.data,
      });
    }
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    const serverDateHeader = response.headers && response.headers['date'];
    if (serverDateHeader) {
      const serverMs = new Date(serverDateHeader).getTime();
      const clientMs = Date.now();
      serverClockOffset = serverMs - clientMs;
      console.log('[DEBUG_TIME] serverDateHeader:', serverDateHeader, 'clientMs:', clientMs, 'serverMs:', serverMs, 'offset:', serverClockOffset);
    } else {
      console.log('[DEBUG_TIME] No Date header found in response. headers:', Object.keys(response.headers || {}));
    }
    // Debug: Log response
    if (__DEV__) {
      log.debug('✅ Axios Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        data: response.data,
      });
    }
    return response.data;
  },
  async (error: unknown) => {
    const axiosError = error as AxiosErrorLike;
    // Debug: Log error
    if (__DEV__) {
      log.debug('❌ Axios Error:', {
        status: axiosError.response?.status,
        statusText: axiosError.message,
        url: axiosError.config?.url,
        data: axiosError.response?.data,
        message: axiosError.response?.data?.message,
      });
    }
    const originalRequest = axiosError?.config as CustomAxiosRequestConfig;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle timeout errors with retry logic
    if (
      axiosError.code === 'ECONNABORTED' ||
      axiosError.message?.includes('timeout') ||
      axiosError.message === 'Network Error'
    ) {
      const retryCount = originalRequest._retryCount || 0;
      const maxRetries = 3;
      const retryDelay = 1000 * (retryCount + 1); // Exponential backoff: 1s, 2s, 3s

      if (retryCount < maxRetries) {
        originalRequest._retryCount = retryCount + 1;

        log.warn(
          `Timeout on ${originalRequest.url} - Retrying (${
            retryCount + 1
          }/${maxRetries}) after ${retryDelay}ms`,
        );

        // Wait before retrying
        await new Promise<void>((resolve) => setTimeout(resolve, retryDelay));

        try {
          return axiosClient(originalRequest);
        } catch (retryError) {
          // If retry fails, continue to error handling below
          log.error(`Retry ${retryCount + 1} failed:`, retryError);
        }
      } else {
        log.error(`Max retries (${maxRetries}) exceeded for ${originalRequest.url}`);
      }
    }

    const isRefreshCall =
      originalRequest.isRefreshRequest || originalRequest.url?.includes('/refresh');

    if (axiosError.response?.status === 401 && !originalRequest._retry && !isRefreshCall) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      log.debug('401 Unauthorized - attempting token refresh');
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = storage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const refreshResponse = await authApi.refreshToken(refreshToken);
        const tokenData = (refreshResponse as any).data || refreshResponse;

        if (!tokenData || (!tokenData.access && !tokenData.accessToken)) {
          throw new Error('Invalid refresh token response structure');
        }

        const newAccessToken = tokenData.accessToken || tokenData.access;
        const newRefreshToken = tokenData.refreshToken || tokenData.refresh || refreshToken;

        storage.setTokens({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });

        // Add events to update auth in Redux state if needed
        // but for now, updating MMKV is enough as storage.getAccessToken() reads it.

        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Retry original request with new access token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        log.debug('Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        isRefreshing = false;

        const refreshToken = storage.getRefreshToken();
        if (refreshToken !== 'mock-refresh-token') {
          storage.clearAuth();

          const { default: AuthEvents, AUTH_LOGOUT_EVENT } = await import('../utils/AuthEvents');
          AuthEvents.emit(AUTH_LOGOUT_EVENT);
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
