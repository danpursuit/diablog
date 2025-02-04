<template>
  <div class="relative inline-block w-32">
    <input
      type="checkbox"
      id="flip-switch"
      :checked="flipped"
      @change="toggle"
      class="absolute inset-0 opacity-0 cursor-pointer" />
    <label
      for="flip-switch"
      class="bg-gray-200 w-full h-8 rounded-full flex items-center relative px-2 transition-colors duration-300 ease-in-out"
      :class="{
        'bg-green-200': flipped,
        'bg-gray-200': !flipped,
      }">
      <!-- Toggle Text -->
      <span
        class="absolute inset-0 flex justify-center items-center text-sm font-medium transition-colors duration-300 ease-in-out select-none"
        :class="{
          'text-gray-250': !flipped,
          'text-green-500': flipped,
        }">
        {{ label }}
      </span>
      <!-- Switch Knob -->
      <div
        :class="{
          'left-1': !flipped,
          'left-[calc(100%-1.75rem)]': flipped,
        }"
        class="absolute bg-white w-6 h-6 rounded-full shadow-md transition-all duration-300 ease-in-out"></div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  flipped: {
    type: Boolean,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["flipped"]);

const toggle = () => {
  emit("flipped", !props.flipped);
};
</script>

<style scoped>
/* Add custom transition for smooth sliding */
label {
  transition: all 0.3s ease-in-out;
}

input:checked + label {
  background-color: #4ade80; /* Green background when ON */
}
</style>
