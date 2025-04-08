<!-- DateDisplay.vue -->
<template>
  <div
    :class="[
      'w-64 p-3 rounded-lg border-2 transition-colors cursor-pointer bg-gradient-to-br from-gray-100 to-gray-300',
      isSelected ? 'border-blue-500' : 'border-gray-200',
    ]"
    @click="$emit('select')">
    <div class="flex items-center gap-2">
      <span class="text-gray-700 shrink-0">{{ label }}:</span>
      <span class="font-medium min-w-[80px]">{{ formatDate(modelValue) }}</span>
      <button
        @click.stop="showCalendar = !showCalendar"
        class="p-1.5 hover:bg-white/50 rounded-full ml-auto">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
    </div>

    <!-- Calendar Dropdown -->
    <div
      v-if="showCalendar"
      class="absolute mt-2 bg-white shadow-lg rounded-lg p-2 z-10">
      <input
        type="date"
        :value="modelValue?.toISOString().split('T')[0]"
        @input="handleDateInput"
        class="border rounded px-2 py-1" />
    </div>

    <!-- Control Buttons -->
    <div class="flex gap-2 mt-2">
      <button
        @click.stop="handleAutoClick"
        class="px-2 py-1 text-sm bg-white/50 hover:bg-white/80 rounded transition-colors">
        Set Auto
      </button>
      <button
        @click.stop="$emit('clear')"
        class="px-2 py-1 text-sm bg-white/50 hover:bg-white/80 rounded transition-colors">
        Clear
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import type { DateFilterValue } from "@/types/DateTypes";

const props = defineProps<{
  modelValue: DateFilterValue;
  label: string;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: DateFilterValue): void;
  (e: "select"): void;
  (e: "auto"): void;
  (e: "clear"): void;
}>();

const showCalendar = ref(false);

const formatDate = (date: DateFilterValue) => {
  if (!date) return "None";
  const utcDateString = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date);
  return utcDateString;
};

const handleDateInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const date = input.value ? new Date(input.value) : null;
  emit("update:modelValue", date);
  showCalendar.value = false;
};

const handleAutoClick = () => {
  emit("auto");
  emit("select");
};

// New paste handling function
const handlePaste = async (event: ClipboardEvent) => {
  if (!props.isSelected) return;

  // Get clipboard text
  const text = await navigator.clipboard.readText();

  // Try to parse the date - this will handle formats like:
  // 2024-02-01, 2024/02/01, 02/01/2024, etc.
  const date = new Date(text);

  // Check if the date is valid
  if (!isNaN(date.getTime())) {
    emit("update:modelValue", date);
  }
};

// Add and remove paste event listener
onMounted(() => {
  document.addEventListener("paste", handlePaste);
});

onUnmounted(() => {
  document.removeEventListener("paste", handlePaste);
});
</script>
