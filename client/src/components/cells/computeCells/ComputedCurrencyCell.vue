<script setup lang="ts">
import { defineProps, ref, inject, watch } from "vue";
import type { ColumnDataSchemaModel } from "@revolist/vue3-datagrid";
import type { SelectableCoin } from "@/stores/coinsStore";

// leftmost cell in table, used to add a sub-row
// todo: props.column.flippedCoins doesn't work well in updateVal
// refactor to make "coins" the list of currencies
// and in the template, select index based on props.column.flippedCoins directly

const props = defineProps<ColumnDataSchemaModel>();
const cell = ref<HTMLElement>();
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
watch(() => props.model.compute, updateVal, {
  immediate: true,
});

// hover function to log data
function handleHover() {
  console.log("hovered", props.model.compute);
  console.log(
    "hovered2",
    props.column.flippedCoins.value,
    props.model.compute.curs[props.column.flippedCoins.value ? 1 : 0]
  );
}
</script>

<template>
  <div ref="cell" class="compute-str compute" @mouseover="handleHover">
    {{
      coins
        ? coins[
            props.column.flippedCoins.value
              ? coins.length - 1 - selectedIndex
              : selectedIndex
          ]
        : ""
    }}
  </div>
</template>
