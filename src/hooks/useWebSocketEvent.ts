import { useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';

/**
 * Hook to subscribe to specific WebSocket events.
 * @param event The event name to listen for.
 * @param callback Function to call when the event is received.
 */
export const useWebSocketEvent = <T = unknown>(event: string, callback: (data: T) => void) => {
  const { on, off } = useWebSocket();

  useEffect(() => {
    on(event, callback as (data: unknown) => void);
    return () => {
      off(event, callback as (data: unknown) => void);
    };
  }, [event, callback, on, off]);
};
