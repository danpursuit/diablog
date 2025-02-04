<script setup lang="ts">
import { defineProps, ref, inject, watch } from "vue";
import type { ColumnDataSchemaModel } from "@revolist/vue3-datagrid";

// leftmost cell in table, used to add a sub-row
// todo: props.column.flippedCoins doesn't work well in updateVal
// refactor to make "coins" the list of currencies
// and in the template, select index based on props.column.flippedCoins directly

const props = defineProps<ColumnDataSchemaModel>();
const cell = ref<HTMLElement>();
const coins = ref<string[] | null>(null);
const updateVal = () => {
  if (props.model.compute && props.model.compute.curs) {
    coins.value = props.model.compute?.curs;
  } else {
    coins.value = null;
  }
};
watch(() => props.model.compute, updateVal, {
  immediate: true,
});
// watch(props.model.flippedCoins?.value, updateVal, {
//   immediate: true,
// });

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
        ? props.column.flippedCoins?.value
          ? coins[coins.length - 1]
          : coins[0]
        : ""
    }}
  </div>
</template>
