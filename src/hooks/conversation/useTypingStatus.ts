/**
 * useTypingStatus Hook
 * Manages typing indicator status and debounced emit
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { CONVERSATION_TIMINGS } from '../../constants/conversationConstants';
import conversationsApi from '../../api/conversationsApi';

interface UseTypingStatusOptions {
  conversationId: string;
  enabled?: boolean;
}

interface UseTypingStatusReturn {
  isTyping: boolean;
  sendTypingIndicator: () => void;
  stopTyping: () => void;
}

export const useTypingStatus = (options: UseTypingStatusOptions): UseTypingStatusReturn => {
  const { conversationId, enabled = true } = options;

  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>();
  const lastSentRef = useRef<number>(0);
  const isMounted = useRef(true);

  // Send typing indicator with debounce
  const sendTypingIndicator = useCallback(() => {
    if (!enabled || !isMounted.current || !conversationId) return;

    const now = Date.now();
    const timeSinceLastSend = now - lastSentRef.current;

    // Only send if enough time has passed
    if (timeSinceLastSend < CONVERSATION_TIMINGS.DEBOUNCE_TYPING) {
      return;
    }

    setIsTyping(true);
    lastSentRef.current = now;

    // Send typing indicator to backend
    conversationsApi.sendMessage(conversationId, '').catch((err) => {
      console.error('[useTypingStatus] Error sending typing indicator:', err);
    });

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout to stop typing
    timeoutRef.current = setTimeout(() => {
      if (isMounted.current) {
        setIsTyping(false);
      }
    }, CONVERSATION_TIMINGS.TYPING_INDICATOR_TIMEOUT);
  }, [conversationId, enabled]);

  // Manually stop typing
  const stopTyping = useCallback(() => {
    if (!isMounted.current) return;

    setIsTyping(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isTyping,
    sendTypingIndicator,
    stopTyping,
  };
};

export default useTypingStatus;
