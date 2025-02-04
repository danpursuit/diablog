<template>
  <div
    :onClick="logTableData"
    class="bg-gradient-to-br from-gray-100 to-gray-300 p-4 rounded-lg shadow-md gap-2 flex flex-row items-center">
    <!-- Display Settings Toggle -->
    <div class="flex">
      <div class="inline-flex items-center space-x-2 bg-white p-2 rounded-md">
        <div
          v-for="mode in displayModes"
          :key="mode.value"
          class="relative group">
          <button
            @click="currentDisplayMode = mode.value"
            class="px-4 py-2 rounded-md transition-all duration-200"
            :class="{
              'bg-blue-500 text-white': currentDisplayMode === mode.value,
              'text-gray-600 hover:bg-gray-100':
                currentDisplayMode !== mode.value,
            }">
            {{ mode.label }}
          </button>
          <!-- Updated Tooltip Position -->
          <div
            class="absolute left-0 top-full mt-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            {{ mode.description }}
            <!-- Tooltip Arrow (now on upper left) -->
            <div
              class="absolute left-4 top-0 -translate-y-full w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-gray-800"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Portfolio Content -->
    <div class="flex flex-row gap-4 overflow-x-auto">
      <div class="flex justify-between items-center bg-white p-3 rounded-md">
        <span class="font-semibold text-gray-700">Total Value:&nbsp;</span>
        <span class="font-bold text-blue-600"
          >${{ getTotalValue.toLocaleString() }}</span
        >
      </div>

      <div
        v-for="(amount, stock) in tableData.netOwned"
        :key="stock"
        class="flex justify-between items-center bg-white p-3 rounded-md">
        <span class="font-medium text-gray-700">{{ stock }}:&nbsp;</span>

        <!-- Simple Mode -->
        <div v-if="currentDisplayMode === 'simple'" class="text-right">
          <span class="font-medium text-green-600">
            {{ numeral(calculateSimpleOwned(stock)).format("0,0.00[000000]") }}
          </span>
          <span class="font-bold text-blue-600 ml-2">
            ${{ numeral(calculateSimpleValue(stock)).format("0,0.00") }}
          </span>
        </div>

        <!-- Regular Mode -->
        <div v-else-if="currentDisplayMode === 'regular'" class="text-right">
          <span class="font-medium" :class="getAmountColor(stock)">
            {{
              numeral(props.tableData.netOwned[stock]).format("0,0.00[000000]")
            }}
          </span>
          <span class="font-bold ml-2" :class="getDollarColor(stock)">
            ${{ numeral(calculateNetValue(stock)).format("0,0.00") }}
          </span>
        </div>

        <!-- Full Mode -->
        <div v-else class="text-right flex flex-col">
          <div class="flex items-center justify-end">
            <span class="text-green-600 font-medium">
              {{
                numeral(calculateSimpleOwned(stock)).format("0,0.00[000000]")
              }}
            </span>
            <span class="text-blue-600 font-bold ml-2">
              ${{ numeral(calculateSimpleValue(stock)).format("0,0.00") }}
            </span>
          </div>

          <div
            v-if="props.tableData.netBorrowed[stock]"
            class="flex items-center justify-end">
            <span class="text-red-600 font-medium">
              -{{
                numeral(props.tableData.netBorrowed[stock]).format(
                  "0,0.00[000000]"
                )
              }}
            </span>
            <span class="text-red-600 font-bold ml-2">
              -${{ numeral(calculateBorrowedValue(stock)).format("0,0.00") }}
            </span>
          </div>

          <div
            v-if="props.tableData.netBorrowed[stock]"
            class="flex items-center justify-end border-t border-gray-200 mt-1 pt-1">
            <span class="font-medium" :class="getAmountColor(stock)">
              {{
                numeral(props.tableData.netOwned[stock]).format(
                  "0,0.00[000000]"
                )
              }}
            </span>
            <span class="font-bold ml-2" :class="getDollarColor(stock)">
              ${{ numeral(calculateNetValue(stock)).format("0,0.00") }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Currency } from "@/utils/currencies";
import { computed, defineProps, ref } from "vue";
import numeral from "numeral";

const props = defineProps({
  manualPrices: {
    type: Object,
    required: true,
  },
  tableData: {
    type: Object,
    required: true,
  },
});

const displayModes = [
  {
    label: "Regular",
    value: "regular",
    description: "Shows net amounts (owned minus borrowed)",
  },
  {
    label: "Simple",
    value: "simple",
    description: "Shows only owned amounts without loans",
  },
  {
    label: "Full",
    value: "full",
    description: "Shows detailed breakdown of owned and borrowed amounts",
  },
];

const currentDisplayMode = ref("regular");

const getPrice = (stock) => {
  return Currency.stable.includes(stock)
    ? 1
    : props.manualPrices[stock] || props.tableData.lastTradePrices[stock];
};

// "net": does not include borrowed
const calculateNetAmount = (stock) => {
  return props.tableData.netOwned[stock];
};
const calculateNetValue = (stock) => {
  return getPrice(stock) * calculateNetAmount(stock);
};

// "simple": use net + borrowed
const calculateSimpleOwned = (stock) => {
  return (
    props.tableData.netOwned[stock] + (props.tableData.netBorrowed[stock] || 0)
  );
};
const calculateSimpleValue = (stock) => {
  return getPrice(stock) * calculateSimpleOwned(stock);
};

const calculateBorrowedValue = (stock) => {
  return getPrice(stock) * (props.tableData.netBorrowed[stock] || 0);
};
// Split the color logic into two functions for amounts and dollar values
const getAmountColor = (stock) => {
  const netAmount = calculateNetAmount(stock);
  return {
    "text-green-600": netAmount > 0,
    "text-red-600": netAmount < 0,
    "text-gray-600": netAmount === 0,
  };
};

const getDollarColor = (stock) => {
  const netAmount = calculateNetAmount(stock);
  return {
    "text-blue-600": netAmount > 0,
    "text-red-600": netAmount < 0,
    "text-gray-600": netAmount === 0,
  };
};

const getTotalValue = computed(() => {
  if (currentDisplayMode.value === "simple") {
    return Object.keys(props.tableData.netOwned).reduce(
      (total, stock) => total + calculateSimpleValue(stock),
      0
    );
  }
  return Object.keys(props.tableData.netOwned).reduce(
    (total, stock) => total + calculateNetValue(stock),
    0
  );
});

const logTableData = () => {
  console.log(
    "clicked",
    props.tableData,
    props.tableData.lastTradePrices,
    props.manualPrices
  );
};
</script>
