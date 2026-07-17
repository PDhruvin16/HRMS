// @ts-nocheck
import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setPreview } from '../store/slices/previewSlice';
import authApi from '../api/authApi';
import { isTokenExpired, getProcessedUrl } from '../utils/mediaUtils';
import { IPreviewToken } from '../types/preview';

interface UsePreviewTokenResult {
  previewToken: IPreviewToken | null;
  processUrl: (path?: string | null) => string | undefined;
  refreshToken: () => Promise<IPreviewToken | null>;
}

/**
 * Hook to manage the lifecycle of a media authorization token (preview token).
 *
 * Fetches/refreshes the token automatically if it's missing or expired.
 */
export const usePreviewToken = (): UsePreviewTokenResult => {
  const dispatch = useDispatch();
  const previewToken = useSelector((state: RootState) => state.previewToken.preview);
  const refreshPromiseRef = useRef<Promise<IPreviewToken | null> | null>(null);

  const refreshToken = useCallback(async (): Promise<IPreviewToken | null> => {
    // Prevent multiple simultaneous refreshes
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    refreshPromiseRef.current = (async () => {
      try {
        const response = await authApi.fetchPreviewToken();
        const tokenData = response?.data;
        const token = tokenData?.token || response?.data?.data?.token;

        if (!token) {
          console.error('Preview token missing', response);
          return null;
        }

        const formattedToken: IPreviewToken = {
          token: token,
          url: tokenData?.url || response?.data?.data?.url,
          expiry: tokenData?.expiry || response?.data?.data?.expiry,
          check_expiry: tokenData?.check_expiry ?? response?.data?.data?.check_expiry ?? true,
        };
        dispatch(setPreview(formattedToken));
        return formattedToken;
      } catch (err) {
        console.error('Failed to fetch preview token:', err);
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }, [dispatch]);

  // Handle automatic refresh on mount or if expired
  useEffect(() => {
    const checkAndRefresh = async () => {
      const isMissing = !previewToken?.token;
      const isExpired = previewToken?.check_expiry && isTokenExpired(previewToken.expiry);

      if (isMissing || isExpired) {
        await refreshToken();
      }
    };

    checkAndRefresh();
  }, [previewToken, refreshToken]);

  /**
   * Helper to process a raw path using the current (or fallback) token data.
   */
  const processUrl = useCallback(
    (path?: string | null) => {
      return getProcessedUrl(path, previewToken);
    },
    [previewToken],
  );

  return {
    previewToken,
    processUrl,
    refreshToken,
  };
};
