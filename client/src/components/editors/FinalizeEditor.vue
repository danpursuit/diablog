<script setup lang="ts">
import { defineProps, ref, inject } from "vue";
import { Plus, Minus } from "lucide-vue-next";
import type { ColumnDataSchemaModel } from "@revolist/vue3-datagrid";
import { RowType } from "@/types/RowType";

const props = defineProps<ColumnDataSchemaModel>();
const inputRef = ref<HTMLInputElement | null>(null);
const cell = ref<HTMLElement>();

// this file doesn't get used, as we have made the column read only
function handleFinalizeRow() {
  console.log("handleFinalizeRow", cell.value);
  const event = new CustomEvent("finalize-row", {
    bubbles: true,
    detail: { rowId: props.model.id },
  });
  cell.value?.dispatchEvent(event);
}
</script>

<template>
  <div ref="cell">
    <button
      @class="
        `px-2 py-1 rounded ${
          props.model.finalized ? 'bg-red-500' : 'bg-green-500'
        } text-white`
      "
      @click="handleFinalizeRow">
      {{ props.model.finalized ? "Delete" : "Finalize" }}
    </button>
  </div>
</template>
