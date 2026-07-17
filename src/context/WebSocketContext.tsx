import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import socketService, { SocketStatus } from '../services/SocketService';
import { useAppSelector } from '../hooks/useRedux';
import { useGlobalSockets } from '../hooks/useGlobalSockets';

interface WebSocketContextType {
  status: SocketStatus;
  connect: () => void;
  disconnect: () => void;
  send: (data: unknown) => void;
  on: (event: string, callback: (data: unknown) => void) => void;
  off: (event: string, callback: (data: unknown) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<SocketStatus>(socketService.getStatus());
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  console.log('[WebSocketProvider] Rendered, isAuthenticated:', isAuthenticated);

  // Call the global sockets hook to handle notification and system sockets
  useGlobalSockets();

  interface SocketStatusChangePayload {
    name: string;
    status: SocketStatus;
  }

  useEffect(() => {
    const handleStatusChange = (data: unknown) => {
      const payload = data as SocketStatusChangePayload;
      if (payload.name === 'system') {
        setStatus(payload.status);
      }
    };

    socketService.on('statusChange', handleStatusChange);

    return () => {
      socketService.off('statusChange', handleStatusChange);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      console.log(
        '[WebSocketProvider] Authenticated, socket connections managed by useGlobalSockets',
      );
    } else {
      console.log('[WebSocketProvider] Unauthenticated, disconnecting all sockets...');
      socketService.disconnect();
    }

    return () => {
      // socketService.disconnect(); // Let the individual hooks or the logout logic handle this
    };
  }, [isAuthenticated]);

  const value: WebSocketContextType = {
    status,
    connect: () => socketService.connect(),
    disconnect: () => socketService.disconnect(),
    send: (data: unknown) => socketService.send(data),
    on: (event: string, callback: (data: unknown) => void) => socketService.on(event, callback),
    off: (event: string, callback: (data: unknown) => void) => socketService.off(event, callback),
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
