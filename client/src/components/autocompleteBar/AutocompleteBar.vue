<template>
  <div
    class="flex flex-row w-full space-x-4 p-2 bg-gray-100 border border-gray-300 rounded shadow-sm">
    <div class="text-xl font-bold flex items-center">{{ name }}s</div>
    <AutocompleteInput
      :items="items"
      @update:items="$emit('update:items', $event)" />
  </div>
</template>

<script setup>
import AutocompleteInput from "./AutocompleteInput.vue";

defineProps({
  items: {
    type: Array,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

defineEmits(["update:items"]);
</script>
