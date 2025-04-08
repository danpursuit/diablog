<script setup lang="ts">
import { computed, defineProps, ref, watch } from "vue";
import type { ColumnDataSchemaModel } from "@revolist/vue3-datagrid";
import numeral from "numeral";

// duplicate of FlexibleComputeCell but with a red highlight if the value is negative
// used to alert if amountOwned < 0

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

  const formattedNumber = numeral(priceValue).format(
    props.column?.numberFormat || "0,0.0[00]"
  );
  // if this is nan, return 0
  if (formattedNumber.toLowerCase() === "nan") {
    return "0";
  }
  return formattedNumber;
});

// Computed property to determine if the price is negative
const hasNegativeBorder = computed(() => {
  if (!coins.value) return false;

  const coinIndex = props.column?.flippedCoins?.value
    ? coins.value.length - 1 - selectedIndex.value
    : selectedIndex.value;

  const selectedCoin = coins.value[coinIndex];
  const priceValue =
    props.model.compute.curData[selectedCoin][props.column.computeProperty];
  if (props.column.compareProperty) {
    const compareValue =
      props.model.compute.curData[selectedCoin][props.column.compareProperty];
    if (priceValue < compareValue) {
      return true;
    }
  }

  return priceValue < 0;
});
</script>

<template>
  <div
    class="compute-num compute"
    :class="{ 'negative-price': hasNegativeBorder }">
    {{ formattedPrice }}
  </div>
</template>

<style scoped>
.negative-price {
  /* border: 4px solid red; */
  box-shadow: inset 0 0 0 2px red;
  background-color: #ffaaaa;
  z-index: 1;
  overflow: auto;
  /* bottom: 1px; */
  /* padding: 2px; */
}
</style>
