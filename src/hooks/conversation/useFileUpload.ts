/**
 * useFileUpload Hook
 * Manages file selection and upload process
 */

import { useState, useCallback, useRef } from 'react';
import { FileUploadProgress } from '../../types/conversationTypes';
import conversationsApi from '../../api/conversationsApi';
import { FILE_UPLOAD_CONFIG, ALLOWED_MEDIA_TYPES } from '../../constants/conversationConstants';

interface UseFileUploadOptions {
  conversationId: string;
  onProgress?: (progress: FileUploadProgress) => void;
  onSuccess?: (mediaPath: string) => void;
  onError?: (error: string) => void;
}

interface UseFileUploadReturn {
  uploading: boolean;
  progress: number;
  error: string | null;
  uploadFile: (file: { uri: string; name: string; type: string }) => Promise<string | null>;
  resetProgress: () => void;
  validateFile: (file: { uri?: string; name: string; type: string; size?: number }) => boolean;
}

export const useFileUpload = (options: UseFileUploadOptions): UseFileUploadReturn => {
  const { conversationId, onProgress, onSuccess, onError } = options;

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  // Validate file before upload
  const validateFile = useCallback(
    (file: { uri?: string; name: string; type: string; size?: number }): boolean => {
      // Check if file type is allowed
      const isAllowed = Object.values(ALLOWED_MEDIA_TYPES).some((types: readonly string[]) =>
        (types as string[]).includes(file.type),
      );

      if (!isAllowed) {
        const errorMsg = 'Invalid file type. Please select a supported file.';
        setError(errorMsg);
        onError?.(errorMsg);
        return false;
      }

      // Check file size
      if (file.size && file.size > FILE_UPLOAD_CONFIG.MAX_FILE_SIZE) {
        const errorMsg = 'File size exceeds the maximum limit.';
        setError(errorMsg);
        onError?.(errorMsg);
        return false;
      }

      return true;
    },
    [onError],
  );

  // Upload file
  const uploadFile = useCallback(
    async (file: { uri: string; name: string; type: string }): Promise<string | null> => {
      if (!isMounted.current) return null;

      // Validate file
      if (!validateFile(file)) {
        return null;
      }

      try {
        setUploading(true);
        setProgress(0);
        setError(null);

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            const nextProgress = prev + Math.random() * 30;
            onProgress?.({
              loaded: nextProgress,
              total: 100,
              percentage: nextProgress,
            });
            return nextProgress;
          });
        }, 500);

        // Create FormData for upload
        const formData = new FormData();
        formData.append('conversation', conversationId);

        // Handle both web File and React Native object format
        if ('uri' in file) {
          // React Native format
          formData.append('media_path', {
            uri: file.uri,
            name: file.name,
            type: file.type,
          } as unknown as Blob);
        } else {
          // Web format
          formData.append('media_path', file as unknown as Blob);
        }

        const response = await conversationsApi.sendMediaMessage(
          conversationId,
          file.type.split('/')[0], // Get type prefix (image, video, audio, application)
          file,
        );

        clearInterval(progressInterval);

        if (!isMounted.current) return null;

        setProgress(100);
        const mediaPath = response.data?.media_path || response.data?.media_id;

        if (mediaPath) {
          onSuccess?.(mediaPath);
          return mediaPath;
        }

        throw new Error('No media path in response');
      } catch (err) {
        if (isMounted.current) {
          const errorMsg = err instanceof Error ? err.message : 'Upload failed';
          setError(errorMsg);
          onError?.(errorMsg);
          console.error('[useFileUpload] Error uploading file:', err);
        }
        return null;
      } finally {
        if (isMounted.current) {
          setUploading(false);
        }
      }
    },
    [conversationId, validateFile, onProgress, onSuccess, onError],
  );

  // Reset progress
  const resetProgress = useCallback(() => {
    if (!isMounted.current) return;
    setProgress(0);
    setError(null);
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadFile,
    resetProgress,
    validateFile,
  };
};

export default useFileUpload;
