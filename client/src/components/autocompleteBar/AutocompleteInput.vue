<template>
  <div class="relative flex flex-1">
    <!-- Input and Dropdown Container -->
    <div class="w-64">
      <!-- Input Field -->
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Type to search..."
        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        @focus="showDropdown = true"
        @keydown.down.prevent="navigateDown"
        @keydown.up.prevent="navigateUp"
        @keydown.enter.prevent="selectHighlighted"
        @keydown.esc="closeDropdown" />

      <!-- Dropdown -->
      <div
        v-if="showDropdown && filteredItems.length > 0"
        class="absolute z-10 w-64 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
        <div
          v-for="(item, index) in filteredItems"
          :key="item.name"
          @click="selectItem(item)"
          @mouseover="highlightedIndex = index"
          class="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
          :class="{ 'bg-blue-50': index === highlightedIndex }">
          {{ item.name }}
        </div>
      </div>
    </div>

    <!-- Selected Items (Chips) and Clear All Button -->
    <div class="flex-1 flex flex-wrap items-center gap-2 ml-4">
      <div
        v-for="item in selectedItems"
        :key="item.name"
        @click="removeItem(item)"
        class="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors cursor-pointer">
        <span>{{ item.name }}</span>
        <span class="text-blue-600 hover:text-blue-800">×</span>
      </div>

      <!-- Clear All Button -->
      <button
        v-if="selectedItems.length >= 2"
        @click="clearAll"
        class="px-3 py-1 bg-pink-100 text-pink-800 rounded-full hover:bg-pink-200 transition-colors">
        Clear all
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["update:items"]);

const searchQuery = ref("");
const showDropdown = ref(false);
const highlightedIndex = ref(-1);

// Computed properties
const selectedItems = computed(() =>
  props.items.filter((item) => item.selected)
);

const filteredItems = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return props.items.filter(
    (item) => !item.selected && item.name.toLowerCase().includes(query)
  );
});

// Watch for changes in searchQuery
watch(searchQuery, (newValue) => {
  if (newValue) {
    showDropdown.value = true;
  }
});

// Methods
const selectItem = (item) => {
  const updatedItems = [...props.items];
  const index = updatedItems.findIndex((i) => i.name === item.name);
  if (index !== -1) {
    updatedItems[index] = { ...updatedItems[index], selected: true };
    emit("update:items", updatedItems);
    searchQuery.value = "";
    highlightedIndex.value = -1;
    // Don't close the dropdown here
  }
};

const removeItem = (item) => {
  const updatedItems = [...props.items];
  const index = updatedItems.findIndex((i) => i.name === item.name);
  if (index !== -1) {
    updatedItems[index] = { ...updatedItems[index], selected: false };
    emit("update:items", updatedItems);
  }
};

const clearAll = () => {
  const updatedItems = props.items.map((item) => ({
    ...item,
    selected: false,
  }));
  emit("update:items", updatedItems);
};

const closeDropdown = () => {
  showDropdown.value = false;
  highlightedIndex.value = -1;
};

// Keyboard navigation methods
const navigateDown = () => {
  if (!showDropdown.value) {
    showDropdown.value = true;
    highlightedIndex.value = 0;
    return;
  }

  if (highlightedIndex.value < filteredItems.value.length - 1) {
    highlightedIndex.value++;
  } else {
    highlightedIndex.value = 0;
  }
};

const navigateUp = () => {
  if (!showDropdown.value) return;

  if (highlightedIndex.value > 0) {
    highlightedIndex.value--;
  } else {
    highlightedIndex.value = filteredItems.value.length - 1;
  }
};

const selectHighlighted = () => {
  if (showDropdown.value && filteredItems.value.length > 0) {
    // If no item is highlighted, select the first item
    if (highlightedIndex.value === -1) {
      selectItem(filteredItems.value[0]);
    } else {
      selectItem(filteredItems.value[highlightedIndex.value]);
    }
  }
};

// Click outside to close dropdown
const handleClickOutside = (event) => {
  if (!event.target.closest(".relative")) {
    closeDropdown();
  }
};

// Lifecycle hooks
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
