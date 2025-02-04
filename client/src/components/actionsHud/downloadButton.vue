<script setup lang="ts">
import { defineProps, ref, inject } from "vue";
import type { ColumnDataSchemaModel } from "@revolist/vue3-datagrid";
import { hudClasses } from "./hudClasses";

import { API } from "../../api/api";
</script>

<template>
  <div class="download-section">
    <button
      id="downloadCSV"
      @click="API.downloadCSV"
      :class="hudClasses.button">
      Download CSV
    </button>
  </div>
</template>
