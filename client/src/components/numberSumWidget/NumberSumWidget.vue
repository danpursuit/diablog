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
    .map((num, index) =>
      index === 0
        ? num.toString()
        : num >= 0
        ? ` + ${num}`
        : ` - ${Math.abs(num)}`
    )
    .join("");
});

const sum = computed(() => numbers.value.reduce((acc, curr) => acc + curr, 0));

const copyToClipboard = async (text, section) => {
  try {
    await navigator.clipboard.writeText(text);
    copyFeedback.value = `${section} copied!`;
    if (feedbackTimeout.value) clearTimeout(feedbackTimeout.value);
    feedbackTimeout.value = setTimeout(() => (copyFeedback.value = ""), 2000);
  } catch {
    copyFeedback.value = "Failed to copy";
  }
};
</script>

<template>
  <div class="w-full max-w-sm p-2 bg-white rounded shadow">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-lg font-bold text-gray-800">⚙️ Quicksum</h1>
      <input
        v-model="widgetName"
        type="text"
        class="px-2 py-1 text-sm border rounded focus:ring focus:ring-blue-400"
        placeholder="Name" />
    </div>

    <div class="mb-3">
      <label class="block text-xs font-medium text-gray-600 mb-1"
        >Enter numbers</label
      >
      <textarea
        v-model="inputText"
        rows="3"
        class="w-full px-2 py-1 text-sm border rounded focus:ring focus:ring-blue-400 resize-none"
        placeholder="12.5 18.75 -30"></textarea>
    </div>

    <div
      class="mb-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition"
      @click="copyToClipboard(formattedExpression || '0', 'Expression')">
      <label
        class="block text-xs font-medium text-gray-600 flex justify-between font-mono">
        {{ formattedExpression || "0" }}
        <Copy class="w-3 h-3 text-gray-500" />
      </label>
    </div>

    <div
      class="p-2 bg-blue-50 rounded hover:bg-blue-100 transition"
      @click="copyToClipboard(sum, 'Sum')">
      <label
        class="block text-xs font-medium text-gray-600 flex justify-between">
        {{ sum.toFixed(6) }}
        <Copy class="w-3 h-3 text-gray-500" />
      </label>
    </div>

    <div
      v-if="copyFeedback"
      class="fixed bottom-2 right-2 bg-gray-800 text-white px-2 py-1 text-xs rounded shadow animate-fade-in-out">
      {{ copyFeedback }}
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in-out {
  animation: fadeInOut 2s ease-in-out;
}
@keyframes fadeInOut {
  0%,
  100% {
    opacity: 0;
    transform: translateY(5px);
  }
  10%,
  90% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
