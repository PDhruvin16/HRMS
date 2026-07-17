/**
 * useChatMessages Hook
 * Manages fetching and caching of messages for a specific conversation
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { BaseMessage } from '../../types/conversationTypes';
import conversationsApi from '../../api/conversationsApi';

interface UseChatMessagesOptions {
  conversationId: string;
  page?: number;
  pageSize?: number;
  autoFetch?: boolean;
}

interface UseChatMessagesReturn {
  messages: BaseMessage[];
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  addMessage: (message: BaseMessage) => void;
  updateMessage: (messageId: string, updates: Partial<BaseMessage>) => void;
  removeMessage: (messageId: string) => void;
}

export const useChatMessages = (options: UseChatMessagesOptions): UseChatMessagesReturn => {
  const { conversationId, page = 1, pageSize = 10, autoFetch = true } = options;

  const [messages, setMessages] = useState<BaseMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const isMounted = useRef(true);

  const hasMore = messages.length < total;

  // Fetch messages
  const fetchMessages = useCallback(
    async (fetchPage: number = 1) => {
      if (!isMounted.current || !conversationId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await conversationsApi.fetchMessages(conversationId, fetchPage, pageSize);

        if (!isMounted.current) return;

        if (fetchPage === 1) {
          setMessages((response.data as BaseMessage[]) || []);
        } else {
          setMessages((prev) => [...((response.data as BaseMessage[]) || []), ...prev]);
        }

        setTotal(response.count || 0);
        setCurrentPage(fetchPage);
      } catch (err) {
        if (isMounted.current) {
          setError(err instanceof Error ? err.message : 'Failed to fetch messages');
          console.error('[useChatMessages] Error fetching messages:', err);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [conversationId, pageSize],
  );

  // Auto fetch on mount
  useEffect(() => {
    isMounted.current = true;

    if (autoFetch && conversationId) {
      fetchMessages(1);
    }

    return () => {
      isMounted.current = false;
    };
  }, [conversationId, autoFetch, fetchMessages]);

  // Refetch messages
  const refetch = useCallback(async () => {
    if (!isMounted.current) return;
    await fetchMessages(1);
  }, [fetchMessages]);

  // Load more messages
  const loadMore = useCallback(async () => {
    if (!isMounted.current || loading || !hasMore) return;
    const nextPage = currentPage + 1;
    await fetchMessages(nextPage);
  }, [loading, currentPage, fetchMessages, hasMore]);

  // Add message to list
  const addMessage = useCallback((message: BaseMessage) => {
    if (!isMounted.current) return;
    setMessages((prev) => [message, ...prev]);
    setTotal((prev) => prev + 1);
  }, []);

  // Update message in list
  const updateMessage = useCallback((messageId: string, updates: Partial<BaseMessage>) => {
    if (!isMounted.current) return;
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg)));
  }, []);

  // Remove message from list
  const removeMessage = useCallback((messageId: string) => {
    if (!isMounted.current) return;
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    setTotal((prev) => Math.max(0, prev - 1));
  }, []);

  return {
    messages,
    loading,
    error,
    total,
    hasMore,
    refetch,
    loadMore,
    addMessage,
    updateMessage,
    removeMessage,
  };
};

export default useChatMessages;
