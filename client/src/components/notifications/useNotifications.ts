// useNotifications.ts
import { ref, onMounted } from "vue";

export enum NotificationType {
  SUCCESS = "success",
  ERROR = "error",
  INFO = "info",
  WARNING = "warning",
}

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
  createdAt: number;
}

export function useNotifications() {
  const notifications = ref<Notification[]>([]);

  const addNotification = (
    message: string,
    type: NotificationType,
    duration: number = 5000
  ) => {
    const id = Math.random().toString(36).substring(2);
    const notification: Notification = {
      id,
      message,
      type,
      duration,
      createdAt: Date.now(),
    };

    notifications.value.push(notification);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id: string) => {
    if (id === "all") {
      notifications.value = [];
      return;
    }
    notifications.value = notifications.value.filter((n) => n.id !== id);
  };

  // Clean up old notifications periodically
  onMounted(() => {
    setInterval(() => {
      const now = Date.now();
      notifications.value = notifications.value.filter((n) => {
        const age = now - n.createdAt;
        return !n.duration || age < n.duration;
      });
    }, 1000);
  });

  return {
    notifications,
    addNotification,
    removeNotification,
  };
}
