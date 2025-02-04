<script setup lang="ts">
import { defineProps, ref, inject } from "vue";
import { Redo } from "lucide-vue-next";
import { hudClasses } from "./hudClasses";

import { API } from "../../api/api";

import type { TransactionRow } from "@/types/TransactionRow";
import type { SetUndoRedo } from "@/types/SetUndoRedoType";
import { onKeyStroke } from "@vueuse/core";
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
const handleRedo = async () => {
  API.redo().then((res) => {
    emit("set-rows", res.table);
    props.setUndoRedo(res.undo, res.redo);
  });
};

// call redo if we ctrl+y
onKeyStroke(
  "y",
  (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
      const target = e.target as HTMLElement;
      const typingInInput =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      // Check if the target is an input or textarea
      if (!typingInInput && props.msg !== "") {
        handleRedo();
        e.preventDefault();
      }
    }
  },
  { dedupe: true }
);
</script>

<template>
  <div class="redo-section relative group inline-block">
    <div
      v-if="msg"
      class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-sm rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      {{ `Redo ${msg}` }}
    </div>
    <button
      id="redoButton"
      @click="handleRedo"
      :class="hudClasses.button"
      :disabled="msg === ''">
      <Redo class="w-4 h-4" />
    </button>
  </div>
</template>
