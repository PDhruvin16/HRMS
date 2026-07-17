import axios from 'axios';
import Constants from 'expo-constants';

const BASE_URL =
  (Constants.expoConfig?.extra?.BASE_URL as string | undefined) ||
  'https://prodapi.salesbot.cloud';

/**
 * AuthClient — for public endpoints (login, register, refresh).
 * No Authorization header is ever added to this client.
 */
export const AuthClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    accept: 'application/json',
    'x-type': 'mobile',
  },
});

/**
 * ApiClient — for all authenticated endpoints.
 * The Authorization header is injected via the request interceptor in api.ts.
 */
export const ApiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    accept: 'application/json',
    'x-type': 'mobile',
  },
});

export { BASE_URL };
