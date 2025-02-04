<script setup lang="ts">
import { defineProps, ref, inject } from "vue";
import { Plus, Minus } from "lucide-vue-next";
import type { ColumnDataSchemaModel } from "@revolist/vue3-datagrid";
import { RowType } from "@/types/RowType";

// leftmost cell in table, used to add a sub-row

const props = defineProps<ColumnDataSchemaModel>();
const cell = ref<HTMLElement>();

function handleAddSubRow() {
  const event = new CustomEvent("add-sub-row", {
    bubbles: true,
    detail: { rowId: props.model.id },
  });
  cell.value?.dispatchEvent(event);
}
</script>

<template>
  <div
    ref="cell"
    class="flex items-center justify-center space-x-1 h-full forceExtend"
    v-if="!props.model.isSubRow && props.model.finalized">
    <button
      @click="handleAddSubRow"
      class="flex items-center justify-center w-full h-full p-1 hover:bg-green-500 group relative">
      <Plus
        class="w-4 h-4 text-gray-500 hover:text-white group-hover:text-white" />
    </button>
  </div>
</template>
