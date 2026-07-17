import { getApiErrorMessage, ApiError } from './errorHandler';

/**
 * Legacy wrapper for the new consolidated error handler.
 * Ensures backward compatibility while providing improved error parsing.
 */
export function extractErrorMessage(err: unknown): string {
  return getApiErrorMessage(err as ApiError);
}
