/**
 * useScrollHandler Hook
 * Manages infinite scroll pagination logic
 */

import { useCallback, useRef, useState } from 'react';

interface UseScrollHandlerOptions {
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number; // pixels from top to trigger load more
}

interface UseScrollHandlerReturn {
  handleScroll: (
    contentOffset: { y: number },
    _contentSize: { height: number },
    _layoutMeasurement: { height: number },
  ) => void;
  isLoadingMore: boolean;
}

export const useScrollHandler = (options: UseScrollHandlerOptions): UseScrollHandlerReturn => {
  const { onLoadMore, hasMore, isLoading, threshold = 100 } = options;

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isLoadingRef = useRef(false);

  // Handle scroll event
  const handleScroll = useCallback(
    (
      contentOffset: { y: number },
      _contentSize: { height: number },
      _layoutMeasurement: { height: number },
    ) => {
      if (isLoadingRef.current || isLoading || !hasMore) return;

      // Check if we've scrolled near the top
      const isNearTop = contentOffset.y < threshold;

      if (isNearTop && !isLoadingRef.current) {
        isLoadingRef.current = true;
        setIsLoadingMore(true);

        onLoadMore()
          .catch((err) => {
            console.error('[useScrollHandler] Error loading more:', err);
          })
          .finally(() => {
            isLoadingRef.current = false;
            setIsLoadingMore(false);
          });
      }
    },
    [onLoadMore, hasMore, isLoading, threshold],
  );

  return {
    handleScroll,
    isLoadingMore,
  };
};

export default useScrollHandler;
