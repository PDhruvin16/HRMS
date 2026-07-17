/**
 * useConversations Hook
 * Manages fetching and caching of conversations list
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Conversation } from '../../api/conversationsApi';
import { RootState, AppDispatch } from '../../store';
import { fetchConversations } from '../../store/slices/conversationSlice';

interface UseConversationsOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  autoFetch?: boolean;
}

interface UseConversationsReturn {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  total: number;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export const useConversations = (options: UseConversationsOptions = {}): UseConversationsReturn => {
  const { page = 1, pageSize = 20, search = '', autoFetch = true } = options;

  const dispatch = useDispatch<AppDispatch>();
  const { conversations, loading, totalCount, error } = useSelector(
    (state: RootState) => state.conversation,
  );
  const [currentPage, setCurrentPage] = useState(page);
  const isMounted = useRef(true);

  // Auto fetch on mount or when deps change
  useEffect(() => {
    isMounted.current = true;

    if (autoFetch) {
      dispatch(fetchConversations({ page: 1, pageSize, search }));
      setCurrentPage(1);
    }

    return () => {
      isMounted.current = false;
    };
  }, [dispatch, search, autoFetch, pageSize]);

  // Refetch conversations
  const refetch = useCallback(async () => {
    if (!isMounted.current) return;

    dispatch(fetchConversations({ page: 1, pageSize, search }));
    setCurrentPage(1);
  }, [dispatch, pageSize, search]);

  // Load more conversations
  const loadMore = useCallback(async () => {
    if (!isMounted.current || conversations.length >= totalCount || loading) return;

    const nextPage = currentPage + 1;
    dispatch(fetchConversations({ page: nextPage, pageSize, search }));
    setCurrentPage(nextPage);
  }, [dispatch, conversations.length, totalCount, loading, currentPage, pageSize, search]);

  return {
    conversations,
    loading,
    error: error || null,
    total: totalCount,
    refetch,
    loadMore,
  };
};

export default useConversations;
