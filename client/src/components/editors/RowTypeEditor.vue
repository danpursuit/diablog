<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { RowType, getRowTypeValues } from "../../types/RowType";

const props = defineProps({
  rowIndex: Number,
  model: Object,
  save: {
    type: Function,
    required: true,
  },
  close: Function,
});

const selectedValue = ref(props.model);

const options = getRowTypeValues(props.model?.isSubRow);
// options to enum

function handleChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  props.save(value);
}

onMounted(() => {
  // Auto-focus the select element when the editor opens
  const selectElement = document.querySelector("select");
  if (selectElement) {
    selectElement.focus();
  }
});
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
