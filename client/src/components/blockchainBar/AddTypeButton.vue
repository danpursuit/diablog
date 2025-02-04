<template>
  <div class="flex items-center w-full max-w-md mx-auto space-x-2">
    <!-- Input -->
    <input
      v-model="newItemTitle"
      :placeholder="`Enter ${name}`"
      @keyup.enter="handleEnterPress"
      class="transition-all duration-300 ease-in-out transform origin-right"
      :class="{
        'w-0 opacity-0 scale-x-0 pointer-events-none': !isInputVisible,
        'w-200 opacity-100 scale-x-100 pl-4 pr-2 py-2 border rounded-md':
          isInputVisible,
      }" />

    <!-- Button -->
    <button
      @click="handleButtonClick"
      class="transition-all duration-300 ease-in-out transform bg-blue-500 text-white px-4 py-2 rounded-md overflow-hidden add-button"
      :class="{
        'bg-gray-300 text-gray-600': !newItemTitle && isInputVisible,
        'bg-blue-500 text-white': newItemTitle || !isInputVisible,
      }">
      {{ isInputVisible ? "+" : `Add ${name}` }}
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:items"]);

const newItemTitle = ref("");
const isInputVisible = ref(false);

const handleButtonClick = () => {
  if (!isInputVisible.value) {
    // First click: show input
    isInputVisible.value = true;
  } else {
    // Second click handling
    if (newItemTitle.value.trim()) {
      // If input has text, add item
      props.items.push({ name: newItemTitle.value.trim(), selected: true });
      // const newItems = [
      //   ...props.items,
      //   { name: newItemTitle.value.trim(), selected: true },
      // ];
      emit("update:items", props.items);
      newItemTitle.value = "";
    }

    // Always reset input visibility on second click
    isInputVisible.value = false;
  }
};
const handleEnterPress = () => {
  if (isInputVisible.value && newItemTitle.value.trim()) {
    props.items.push({ name: newItemTitle.value.trim(), selected: true });
    emit("update:items", props.items);
    newItemTitle.value = "";
    isInputVisible.value = false;
  }
};
</script>

<style scoped>
.add-button {
  /* otherwise does a weird height increase during transition */
  max-height: 38px;
}
</style>
