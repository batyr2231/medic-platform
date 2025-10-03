interface Window {
  Notification: {
    requestPermission(): Promise<NotificationPermission>;
    permission: NotificationPermission;
  };
}