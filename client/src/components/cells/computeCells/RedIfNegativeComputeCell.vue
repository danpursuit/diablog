<script setup lang="ts">
import { computed, defineProps, ref, watch } from "vue";
import type { ColumnDataSchemaModel } from "@revolist/vue3-datagrid";
import numeral from "numeral";

// duplicate of FlexibleComputeCell but with a red highlight if the value is negative
// used to alert if amountOwned < 0

const props = defineProps<ColumnDataSchemaModel>();

const coins = ref<string[] | null>(null);

const updateVal = () => {
  if (props.model.compute && props.model.compute.curs) {
    coins.value = props.model.compute.curs;
  } else {
    coins.value = null;
  }
};

watch(() => props.model.compute, updateVal, { immediate: true });

// Computed property to get the formatted price
const formattedPrice = computed(() => {
  if (!coins.value) return "";

  const coinIndex = props.column?.flippedCoins?.value
    ? coins.value.length - 1
    : 0;

  const selectedCoin = coins.value[coinIndex];
  const priceValue =
    props.model.compute.curData[selectedCoin][props.column.computeProperty];

  return numeral(priceValue).format(
    props.column?.numberFormat || "0,0.0[000000]"
  );
});

// Computed property to determine if the price is negative
const hasNegativeBorder = computed(() => {
  if (!coins.value) return false;

  const coinIndex = props.column?.flippedCoins?.value
    ? coins.value.length - 1
    : 0;

  const selectedCoin = coins.value[coinIndex];
  const priceValue =
    props.model.compute.curData[selectedCoin][props.column.computeProperty];

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
