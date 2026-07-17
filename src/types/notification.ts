export interface NotificationState {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  notification_type: 'system' | 'message' | 'alert';
  created_at: string;
  data?: Record<string, unknown>;
}

export interface Notification {
  readNotification: NotificationState[];
  unReadNotification: NotificationState[];
}
