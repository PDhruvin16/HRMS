// @ts-nocheck
import { useEffect } from 'react';
import socketService from '../services/SocketService';
import { useAppDispatch, useAppSelector } from './useRedux';
import { API_ENDPOINTS } from '../api/endpoints';
import { fetchConversations, incrementUnreadCount } from '../store/slices/conversationSlice';
import {
  fetchUnreadNotificationCount,
  addNotificationOnTop,
  markAsRead,
} from '../store/slices/notificationSlice';
import { NotificationState } from '../types/notification';
import { useToast } from '../context/ToastContext';

export const useGlobalSockets = () => {
  const { isAuthenticated, tenant, access: token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const handleStatusChange = (data: unknown) => {
    const statusData = data as { name: string; status: string };
    console.log(`[useGlobalSockets] 🌐 Socket ${statusData.name} status:`, statusData.status);
  };

  const handleSystemUpdate = (data: unknown) => {
    console.log('[useGlobalSockets] 📢 System Message received:', data);

    interface SystemSocketMessage {
      type?: string;
      payload?: { type?: string; [key: string]: unknown };
      data?: { type?: string; [key: string]: unknown };
      [key: string]: unknown;
    }

    const fullMessage = data as SystemSocketMessage;
    const message = fullMessage.payload || fullMessage.data || fullMessage;

    if (message.type === 'etl_tracker_update') {
      console.log('[useGlobalSockets] 🧠 Global ETL Update detected:', message);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const tenantId = tenant?.id;

    if (token === 'mock-access-token') {
      console.log('[useGlobalSockets] 🔌 Bypassing global socket connections for mock testing.');
      return;
    }

    if (!tenantId || !token) {
      console.warn('[useGlobalSockets] ⚠️ Missing tenantId or token. Cannot connect sockets.', {
        hasTenantId: !!tenantId,
        hasToken: !!token,
        isAuthenticated,
      });
      return;
    }

    console.log('[useGlobalSockets] 🔌 Connecting global sockets for tenant:', tenantId);

    // Initial fetch of the current state backlog to populate the header count
    dispatch(fetchUnreadNotificationCount());

    // Connect to Notification Socket
    const notificationUrl = API_ENDPOINTS.API.NOTIFICATION.WEBSOCKET_URL(tenantId, token);
    socketService.connect('notifications', notificationUrl);

    // Connect to System Update Socket
    const systemUpdateUrl = API_ENDPOINTS.API.SYSTEM_STATUS.WEBSOCKET_URL(tenantId, token);
    socketService.connect('system', systemUpdateUrl);

    interface NotificationPayload {
      id: string;
      title: string;
      message?: string;
      body?: string;
      type?: string;
      notification_type?: string;
      notification_channel_type?: string;
      object_id?: string;
      sent_time?: string;
      created_at?: string;
      [key: string]: unknown;
    }

    const handleNotification = (data: unknown) => {
      const payload = data as NotificationPayload;
      console.log('[Socket:notifications] 📩 Inbound Event Received:', payload);

      // SAFETY CRITICAL: Server often broadcasts simple wrapper messages {"success":true, "message":"..."}
      // Mapping these as full notifications creates phantom unread entries (incrementing counters incorrectly).
      // We MUST hard-guard only allowing entries carrying explicit item identifiers!
      if (!payload.id) {
        console.log(
          '[Socket:notifications] 🛡️ Filtering out metadata confirmation wrapper (No ID found)',
        );
        return;
      }

      const isRead = payload.is_read === true;

      if (isRead) {
        // If message specifically identifies as already read, dynamically subtract it from global unread counters!
        console.log(`[Socket:notifications] 🔄 Syncing READ state for known item: ${payload.id}`);
        dispatch(markAsRead(payload.id));
      } else {
        // Map confirmed new unread objects into the global Redux pool
        const notificationObj: NotificationState = {
          id: payload.id,
          title: payload.title || 'New Notification',
          message: payload.body || payload.message || 'No description provided',
          is_read: false,
          notification_type: payload.notification_type === 'message' ? 'message' : 'system',
          created_at: payload.sent_time || payload.created_at || new Date().toISOString(),
        };

        console.log(
          `[Socket:notifications] 📥 Pushing new unread item into global backlog stack: ${payload.id}`,
        );
        dispatch(addNotificationOnTop(notificationObj));

        // 🚀 VISUAL ALERT: Deliver contextual Toast notification to current active layout screen!
        showToast({
          message: `🔔 ${payload.title || 'New notification received!'}`,
          type: 'info',
          duration: 4000,
        });
      }

      // CRITICAL: Handle real-time updates for WhatsApp conversations from the notification socket
      // The backend often sends notifications here when the dedicated conversation socket is asleep
      if (
        (payload.notification_type === 'message' || payload.type === 'message') &&
        payload.notification_channel_type === 'whatsapp' &&
        payload.object_id
      ) {
        console.log('[Socket:notifications] 🔄 New WhatsApp message detected. Syncing listing...');

        // 1. Immediate UI feedback — increment unread badge locally
        dispatch(incrementUnreadCount(payload.object_id));

        // 2. Full synchronization — refetch page 1 silently (no loaders)
        dispatch(fetchConversations({ page: 1, pageSize: 20, search: '', silent: true }));
      }
    };

    // Register global listeners
    socketService.on('statusChange', handleStatusChange);
    socketService.on('notifications:message', handleNotification);
    socketService.on('system:message', handleSystemUpdate);

    return () => {
      console.log('[useGlobalSockets] 🔌 Disconnecting global sockets');
      socketService.off('statusChange', handleStatusChange);
      socketService.off('notifications:message', handleNotification);
      socketService.off('system:message', handleSystemUpdate);
      socketService.disconnect('notifications');
      socketService.disconnect('system');
    };
  }, [isAuthenticated, tenant, token, dispatch, showToast]);
};
