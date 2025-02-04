<script setup lang="ts">
import { defineProps, ref, inject } from "vue";
import { Plus, Minus } from "lucide-vue-next";
import type { ColumnDataSchemaModel } from "@revolist/vue3-datagrid";
import { RowType } from "@/types/RowType";

// contains both a "Finalize(save)" and "Delete" button depending on the row's finalized status
const props = defineProps<ColumnDataSchemaModel>();
const cell = ref<HTMLElement>();

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
  <div ref="cell" class="forceExtend">
    <button
      v-if="props.model.finalized"
      :class="`hover:bg-red-400 w-full h-full group`"
      @click="handleFinalizeRow">
      <!-- <span class="group-hover:hidden"> ❌ </span>
      <span class="hidden group-hover:block"> Delete </span> -->
      ❌
    </button>
    <button
      v-if="!props.model.finalized"
      :class="`hover:bg-green-400 w-full h-full group`"
      @click="handleFinalizeRow">
      <!-- <span class="group-hover:hidden"> ✅ </span>
      <span class="hidden group-hover:block"> Finalize </span> -->
      ✅
    </button>
  </div>
</template>
