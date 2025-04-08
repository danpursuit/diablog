<script setup lang="ts">
import { computed, defineProps, ref, watch } from "vue";
import type { ColumnDataSchemaModel } from "@revolist/vue3-datagrid";
import type { SelectableCoin } from "@/stores/coinsStore";
import { formatNumber } from "@/utils/numberFormatting";

const props = defineProps<ColumnDataSchemaModel>();

const coins = ref<string[] | null>(null);
const selectedIndex = ref<number>(0);

const updateVal = () => {
  if (props.model.compute && props.model.compute.curs) {
    coins.value = props.model.compute?.curs;
    if (coins.value !== null) {
      // should always be true; for typescript
      const selectedCoins = props.column.focusCoins.value.filter(
        (c: SelectableCoin) => c.selected
      );
      if (selectedCoins.length > 0) {
        // search coins to see if we have a match with the first focus coin
        const focusCoin = selectedCoins[0].name;
        const focusIndex = coins.value.findIndex((coin) => coin === focusCoin);
        // if we find coin, set selectedIndex to that index
        selectedIndex.value = focusIndex !== -1 ? focusIndex : 0;
      } else {
        selectedIndex.value = 0;
      }
    }
  } else {
    coins.value = null;
    selectedIndex.value = 0;
  }
};

watch(() => props.model.compute, updateVal, { immediate: true });

// Computed property to get the formatted price
const formattedPrice = computed(() => {
  if (!coins.value) return "";

  const coinIndex = props.column?.flippedCoins?.value
    ? coins.value.length - 1 - selectedIndex.value
    : selectedIndex.value;

  const selectedCoin = coins.value[coinIndex];
  const priceValue =
    props.model.compute.curData[selectedCoin][props.column.computeProperty];

  // return numeral(priceValue).format(
  //   props.column?.numberFormat || "0,0.0[000000]"
  // );
  const formattedNumber =
    Math.abs(priceValue) > 0.0001 || priceValue === 0
      ? formatNumber(priceValue, props.column?.numberFormat || "0,0.0[00]")
      : formatNumber(priceValue, props.column?.numberFormat || "0,0.0[000000]");
  // if this is nan, return 0
  if (formattedNumber.toLowerCase() === "nan") {
    return "0";
  }
  return formattedNumber;
});
</script>

<template>
  <div class="compute-num compute">
    {{ formattedPrice }}
  </div>
</template>
