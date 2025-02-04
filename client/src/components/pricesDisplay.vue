<template>
  <div
    class="bg-gradient-to-br from-gray-200 to-gray-400 p-4 rounded-lg shadow-lg">
    <div class="flex flex-row gap-4 overflow-x-auto">
      <div
        v-for="(tradePrice, stock) in tableData.lastTradePrices"
        :key="stock"
        class="bg-white rounded-md p-3 shadow-sm group max-w-[150px]">
        <div class="flex items-center justify-between mb-1">
          <label class="text-sm font-medium text-gray-700">
            ${{ stock }}
          </label>
          <div class="flex items-center">
            <span
              v-if="!manualPrices[stock]"
              class="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800 select-none">
              lastTrade
            </span>
            <span
              v-if="manualPrices[stock]"
              class="text-xs font-semibold px-2 py-0.5 rounded-full group-hover:hidden bg-blue-100 text-blue-800 select-none">
              manual
            </span>
            <button
              v-if="manualPrices[stock]"
              @click="updateManualPrice(stock, 0)"
              class="hidden group-hover:inline-block ml-2 text-xs text-red-500 hover:text-red-700">
              ✕ Clear
            </button>
          </div>
        </div>
        <input
          type="number"
          :value="
            manualPrices[stock] ||
            numeral(tableData.lastTradePrices[stock]).format('0.00[0000]')
          "
          @input="updateManualPrice(stock, $event.target.value)"
          class="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import numeral from "numeral";

const props = defineProps({
  tableData: {
    type: Object,
    required: true,
  },
  manualPrices: {
    type: Object,
    required: true,
  },
  updateManualPrice: {
    type: Function,
    required: true,
  },
});
</script>
