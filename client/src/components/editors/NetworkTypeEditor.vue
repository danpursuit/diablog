<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { RowType, getRowTypeValues } from "../../types/RowType";
import type { EditorType } from "@revolist/vue3-datagrid";

const props = defineProps<EditorType>();

const selectedValue = ref(props.model.network);

const options = ref(props.column.column.searchTerms);

function handleChange(event: Event) {
  console.log("model was", props.model);
  const value = (event.target as HTMLSelectElement).value;
  props.save(value);
}
</script>

<template>
  <select
    :value="selectedValue"
    @change="handleChange"
    class="w-full h-full px-2 border-none outline-none">
    <option v-for="option in options" :key="option" :value="option">
      {{ option }}
    </option>
  </select>
</template>
