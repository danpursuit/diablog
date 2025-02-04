<script setup lang="ts">
import { defineProps, ref, inject } from "vue";
import { onKeyStroke } from "@vueuse/core";
import { Undo } from "lucide-vue-next";
import { hudClasses } from "./hudClasses";

import { API } from "../../api/api";

import type { TransactionRow } from "@/types/TransactionRow";
import type { SetUndoRedo } from "@/types/SetUndoRedoType";
import { preprocessServerRows } from "@/utils/preprocessServerRows";

// define props and events we will use
const props = defineProps<{
  msg: string;
  setUndoRedo: SetUndoRedo;
}>();
const emit = defineEmits<{
  (event: "set-rows", data: TransactionRow[]): void;
}>();

// the actual undo function, calls API
const handleUndo = async () => {
  API.undo().then((res) => {
    emit("set-rows", res.table);
    props.setUndoRedo(res.undo, res.redo);
  });
};

// call undo if we ctrl+z
onKeyStroke(
  "z",
  (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
      const target = e.target as HTMLElement;
      const typingInInput =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      // Check if the target is an input or textarea
      if (!typingInInput && props.msg !== "") {
        handleUndo();
        e.preventDefault();
      }
    }
  },
  { dedupe: true }
);
</script>

<template>
  <div class="undo-section relative group inline-block">
    <div
      v-if="msg"
      class="absolute bottom-full mb-2 whitespace-nowrap bg-gray-800 text-white text-sm rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      {{ `Undo ${msg}` }}
    </div>
    <button
      id="undoButton"
      @click="handleUndo"
      :class="hudClasses.button"
      :disabled="msg === ''">
      <Undo class="w-4 h-4" />
    </button>
  </div>
</template>
