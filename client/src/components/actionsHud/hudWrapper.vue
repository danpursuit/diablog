<script setup lang="ts">
import { defineProps, ref, inject } from "vue";
</script>
<template>
  <div class="flex flex-row gap-4 bg-blue-50 p-2 rounded-lg items-center">
    <slot></slot>
  </div>
</template>
