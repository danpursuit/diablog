<script setup lang="ts">
import { defineProps, ref, inject } from "vue";
import type { ColumnDataSchemaModel } from "@revolist/vue3-datagrid";
import { hudClasses } from "./hudClasses";

import { API } from "../../api/api";

import type { TransactionRow } from "@/types/TransactionRow";
import type { SetUndoRedo } from "@/types/SetUndoRedoType";
import { NotificationType } from "../notifications/useNotifications";

const props = defineProps<{
  setUndoRedo: SetUndoRedo;
  addNotification: (message: string, type: NotificationType) => void;
}>();

const emit = defineEmits<{
  (event: "upload-success", data: TransactionRow[]): void;
}>();

const isUploading = ref(false);
const handleUpload = async () => {
  const fileInput = document.getElementById("csvFile") as HTMLInputElement;

  try {
    if (!fileInput?.files?.[0]) {
      alert("Please select a file first");
      return;
    }

    const file = fileInput.files[0];
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      alert("Please select a CSV file");
      return;
    }

    // Show loading state
    isUploading.value = true;

    const formData = new FormData();
    formData.append("file", file);
    const rows = await API.uploadCSV(formData, props.setUndoRedo);

    fileInput.value = "";
    emit("upload-success", rows);
    props.addNotification(
      "New Transactions Loaded Successfully!",
      NotificationType.SUCCESS
    );
  } catch (error) {
    console.log("Error uploading CSV:", error);
    props.addNotification(
      "Failed to upload. Please contact your dev.",
      NotificationType.ERROR
    );
  } finally {
    isUploading.value = false;
  }
};
</script>

<template>
  <div class="upload-section">
    <button
      id="uploadCSVButton"
      @click="handleUpload"
      :disabled="isUploading"
      :class="hudClasses.button">
      {{ isUploading ? "Uploading..." : "Upload CSV" }}
    </button>
    <input type="file" id="csvFile" accept=".csv" class="text-xs pl-2" />
  </div>
</template>
