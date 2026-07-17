import { BASE_URL } from '../services/api';
import { IPreviewToken } from '../types/preview';

/**
 * Processes a raw media path into a fully qualified, authenticated URL.
 *
 * @param path - Relative media path from the backend
 * @param tokenData - Current preview token mapping from Redux
 * @returns Fully qualified, tokenized URL
 */
export const getProcessedUrl = (
  path?: string | null,
  tokenData?: IPreviewToken | null,
): string | undefined => {
  if (!path) return undefined;

  // If path is already a full URL or a local URI, return it
  if (path.startsWith('http') || path.startsWith('file://') || path.startsWith('content://')) {
    return path;
  }

  const normalizedPath = path.replace(/^\//, '');

  if (tokenData?.url && tokenData?.token) {
    const baseUrl = tokenData.url.endsWith('/') ? tokenData.url : `${tokenData.url}/`;
    const separator = normalizedPath.includes('?') ? '&' : '?';
    // If token already looks like a query string (Azure SAS e.g. se=...), append it directly
    const tokenPart = tokenData.token.includes('=') ? tokenData.token : `token=${tokenData.token}`;
    return `${baseUrl}${normalizedPath}${separator}${tokenPart}`;
  }

  // Fallback to BASE_URL if token data is unavailable
  const base = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
  return `${base}${normalizedPath}`;
};

/**
 * Checks if a token is expired.
 */
export const isTokenExpired = (expiry?: string | null): boolean => {
  if (!expiry) return true;
  const expiryDate = new Date(expiry);
  const now = new Date();
  // Buffer of 1 minute to avoid race conditions
  return expiryDate.getTime() - now.getTime() < 60000;
};
