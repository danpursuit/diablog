<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { RowType, getRowTypeValues } from "../../types/RowType";
import type { EditorType } from "@revolist/vue3-datagrid";
import type { DraggableTag } from "@/stores/tagsStore";

const props = defineProps<EditorType>();

const currentValue = ref(props.value);
// const possibleTags = props.column.column.searchTerms.value
//   .map((tag: DraggableTag) => tag.name)
//   .filter((tag: string) => tag !== "All");
const possibleTags = computed(() =>
  props.column.column.searchTerms.value
    .map((tag: DraggableTag) => tag.name)
    .filter((tag: string) => tag !== "All" && tag !== "")
);
const showTagMenu = ref(false);

// options to enum

function handleChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  props.save(value);
}

const removeTag = (tag: string) => {
  const newTags = currentValue.value.filter((t: string) => t !== tag);
  props.save(newTags);
};
const addTag = (tag: string) => {
  // Prevent adding duplicate tags
  if (!currentValue.value.includes(tag)) {
    const newTags = [...currentValue.value, tag];
    props.save(newTags);
  }
  showTagMenu.value = false;
};
const toggleTagMenu = () => {
  showTagMenu.value = !showTagMenu.value;
};
</script>

<template>
  <div class="flex items-center gap-2 flex-wrap relative">
    <div
      v-for="tag in currentValue"
      :key="tag"
      class="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
      <span class="mr-2">{{ tag }}</span>
      <button
        @click="removeTag(tag)"
        class="hover:bg-blue-200 rounded-full p-1 transition-colors">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <button
      @click="toggleTagMenu"
      class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-blue-600 transition-colors">
      +
    </button>

    <div
      v-if="showTagMenu"
      class="absolute top-full left-0 mt-2 bg-white border rounded shadow-lg z-10">
      <div
        v-for="tag in possibleTags.filter((t: string) => !currentValue.includes(t))"
        :key="tag"
        @click="addTag(tag)"
        class="px-3 py-2 hover:bg-gray-100 cursor-pointer">
        {{ tag }}
      </div>
    </div>
  </div>
</template>
