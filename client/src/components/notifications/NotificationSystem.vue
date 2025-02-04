<script setup lang="ts">
import type { Notification } from "./useNotifications";
import { NotificationType } from "./useNotifications";

defineProps<{
  notifications: Notification[];
  removeNotification: (id: string) => void;
}>();
</script>

<template>
  <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
    <!-- display button if len notifications > 1 -->
    <button
      v-if="notifications.length > 1"
      @click="removeNotification('all')"
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      Clear all
    </button>
    <TransitionGroup name="notification" tag="div" class="flex flex-col gap-2">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'min-w-[300px] max-w-[400px] p-4 rounded-lg shadow-lg',
          'flex items-center justify-between',
          {
            'bg-green-100 text-green-800':
              notification.type === NotificationType.SUCCESS,
            'bg-red-100 text-red-800':
              notification.type === NotificationType.ERROR,
            'bg-blue-100 text-blue-800':
              notification.type === NotificationType.INFO,
            'bg-yellow-100 text-yellow-800':
              notification.type === NotificationType.WARNING,
          },
        ]">
        <span>{{ notification.message }}</span>
        <button
          @click="removeNotification(notification.id)"
          class="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none">
          ×
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
