<script setup>
import { ref, computed } from "vue";
import { Copy } from "lucide-vue-next";

const inputText = ref("");
const widgetName = ref("Name");
const copyFeedback = ref("");
const feedbackTimeout = ref(null);

const numbers = computed(() => {
  return inputText.value
    .replace(/,/g, "")
    .split(" ")
    .filter((val) => val.trim() !== "" && !isNaN(val))
    .map(Number);
});

const formattedExpression = computed(() => {
  return numbers.value
    .map((num, index) => {
      if (index === 0) return num.toString();
      return num >= 0 ? ` + ${num}` : ` - ${Math.abs(num)}`;
    })
    .join("");
});

const sum = computed(() => {
  return numbers.value.reduce((acc, curr) => acc + curr, 0);
});

const copyToClipboard = async (text, section) => {
  try {
    await navigator.clipboard.writeText(text);
    copyFeedback.value = `${section} copied!`;

    if (feedbackTimeout.value) {
      clearTimeout(feedbackTimeout.value);
    }

    feedbackTimeout.value = setTimeout(() => {
      copyFeedback.value = "";
    }, 2000);
  } catch (err) {
    copyFeedback.value = "Failed to copy";
  }
};
</script>

<template>
  <div class="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
    <!-- Title with Name Input -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">⚙️ Quicksum</h1>
      <input
        v-model="widgetName"
        type="text"
        class="px-3 py-1 text-lg border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Name" />
    </div>

    <!-- Input Section -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Enter numbers (separated by spaces)
      </label>
      <textarea
        v-model="inputText"
        rows="5"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        placeholder="Example: 12.5 18.75 -30"></textarea>
    </div>

    <!-- Expression Display -->
    <div
      class="mb-4 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors relative group"
      @click="copyToClipboard(formattedExpression || '0', 'Expression')">
      <label
        class="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
        <span>Expression</span>
        <div class="flex items-center text-gray-500 cursor-pointer">
          <Copy class="w-4 h-4 mr-1" />
        </div>
      </label>
      <div class="text-lg text-gray-800 font-mono">
        {{ formattedExpression || "0" }}
      </div>
    </div>

    <!-- Sum Display -->
    <div
      class="p-3 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors relative group"
      @click="copyToClipboard(sum.toFixed(2), 'Sum')">
      <label
        class="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
        <span>Sum</span>
        <div class="flex items-center text-gray-500 cursor-pointer">
          <Copy class="w-4 h-4 mr-1" />
        </div>
      </label>
      <div class="text-xl font-semibold text-blue-600">
        {{ sum.toFixed(2) }}
      </div>
    </div>

    <!-- Copy Feedback -->
    <div
      v-if="copyFeedback"
      class="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in-out">
      {{ copyFeedback }}
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in-out {
  animation: fadeInOut 2s ease-in-out;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  10% {
    opacity: 1;
    transform: translateY(0);
  }
  90% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-10px);
  }
}
</style>
