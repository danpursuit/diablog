<script setup lang="ts">
import { computed, defineProps, ref, watch } from "vue";
import type { ColumnDataSchemaModel } from "@revolist/vue3-datagrid";
import numeral from "numeral";

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
</script>

<template>
  <div class="compute-num compute">
    {{ formattedPrice }}
  </div>
</template>
