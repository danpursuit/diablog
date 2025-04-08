<!-- DateRangeSelector.vue -->
<template>
  <div class="flex gap-4 items-start">
    <DateDisplay
      :model-value="dateRange[0]"
      label="From"
      :is-selected="minDateSelected"
      @update:model-value="updateMinDate"
      @select="selectMinDate"
      @auto="setAutoMin"
      @clear="clearMin" />

    <DateDisplay
      :model-value="dateRange[1]"
      label="To"
      :is-selected="maxDateSelected"
      @update:model-value="updateMaxDate"
      @select="selectMaxDate"
      @auto="setAutoMax"
      @clear="clearMax" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import DateDisplay from "./DateDisplay.vue";
import type { DateFilterValue } from "@/types/DateTypes";

interface TransactionRow {
  date: string | Date;
  [key: string]: any;
}

const props = defineProps<{
  rows: TransactionRow[];
  dateRange: [DateFilterValue, DateFilterValue];
}>();

const emit = defineEmits<{
  (e: "update:dateRange", value: [DateFilterValue, DateFilterValue]): void;
}>();

// State
const minDateSelected = ref(false);
const maxDateSelected = ref(false);

// Selection handlers
const selectMinDate = () => {
  minDateSelected.value = true;
  maxDateSelected.value = false;
};

const selectMaxDate = () => {
  maxDateSelected.value = true;
  minDateSelected.value = false;
};

// Update handlers
const updateDateRange = (index: 0 | 1, newDate: DateFilterValue) => {
  const newRange: [DateFilterValue, DateFilterValue] = [...props.dateRange];
  newRange[index] = newDate;
  emit("update:dateRange", newRange);
};

const updateMinDate = (date: DateFilterValue) => {
  updateDateRange(0, date);
};

const updateMaxDate = (date: DateFilterValue) => {
  updateDateRange(1, date);
};

// Auto and clear handlers
const setAutoMin = () => {
  const minDate = props.rows.reduce((min: DateFilterValue, row) => {
    const date = new Date(row.date);
    return min === null || date < min ? date : min;
  }, null);
  updateDateRange(0, minDate);
};

const setAutoMax = () => {
  const maxDate = props.rows.reduce((max: DateFilterValue, row) => {
    const date = new Date(row.date);
    return max === null || date > max ? date : max;
  }, null);
  updateDateRange(1, maxDate);
};

const clearMin = () => updateDateRange(0, null);
const clearMax = () => updateDateRange(1, null);

// Keyboard navigation
const handleKeyDown = (e: KeyboardEvent) => {
  if (!minDateSelected.value && !maxDateSelected.value) return;

  const selectedIndex = minDateSelected.value ? 0 : 1;
  const currentDate = props.dateRange[selectedIndex];
  if (!currentDate) return;

  if (e.key === "ArrowLeft") {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    updateDateRange(selectedIndex as 0 | 1, newDate);
  } else if (e.key === "ArrowRight") {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    updateDateRange(selectedIndex as 0 | 1, newDate);
  }
};

// Click outside handler
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const isOutside = !target.closest(".rounded-lg");
  if (isOutside) {
    minDateSelected.value = false;
    maxDateSelected.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("click", handleClickOutside);
});
</script>
