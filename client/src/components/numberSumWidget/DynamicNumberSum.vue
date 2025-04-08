<script setup>
import { ref } from "vue";
import NumberSumWidget from "@/components/numberSumWidget/NumberSumWidget.vue";

const widgets = ref([]);

const addWidget = () => {
  widgets.value.push({ id: Date.now() });
};

const removeWidget = (id) => {
  widgets.value = widgets.value.filter((widget) => widget.id !== id);
};
</script>

<template>
  <div class="w-full" :class="{ 'px-1 py-1': widgets.length > 0 }">
    <div class="flex justify-start mb-2">
      <button
        @click="addWidget"
        class="px-2 py-1 bg-blue-500 text-white rounded shadow hover:bg-blue-600">
        +
      </button>
    </div>
    <div
      v-if="widgets.length"
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
      <div v-for="widget in widgets" :key="widget.id" class="relative">
        <NumberSumWidget />
        <button
          @click="removeWidget(widget.id)"
          class="absolute top-3 left-40 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          ×
        </button>
      </div>
    </div>
  </div>
</template>
