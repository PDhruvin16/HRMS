import { useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { getApiErrorMessage, ApiError } from '../utils/errorHandler';
import log from '../utils/Logger';

/**
 * Hook to handle API errors and show toast notifications.
 */
export const useErrorHandle = () => {
  const { showToast } = useToast();

  const handleError = useCallback(
    (error: unknown, fallbackMessage?: string) => {
      const apiError = error as ApiError;

      // Log the full error for debugging
      if (__DEV__) {
        log.error('API Error captured by useErrorHandle:', apiError);
      }

      const message = getApiErrorMessage(apiError);

      showToast({
        message: message || fallbackMessage || 'Something went wrong',
        type: 'error',
      });

      return message;
    },
    [showToast],
  );

  return { handleError };
};
