<template>
  <div class="drag-row flex items-center space-x-2">
    <draggable
      v-model="props.items"
      transition="100"
      class="drop-zone flex items-center space-x-2"
      @update:model-value="emitUpdate">
      <template v-slot:item="{ item }">
        <div
          v-if="item.name"
          class="draggable-item px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 active:bg-gray-200 cursor-pointer transition"
          :class="{ selected: item.selected }"
          @click="(event) => toggleItemSelection(item, event)">
          {{ item.name }}
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from "vue";
import Draggable from "vue3-draggable";

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["update:items"]);

const emitUpdate = (newValue) => {
  emit("update:items", newValue);
};
const toggleItemSelection = (itemToToggle, event) => {
  if (event && event.metaKey) {
    const allUnselected = props.items
      .filter((item) => item !== itemToToggle)
      .every((item) => !item.selected);
    if (allUnselected) {
      // If all items are unselected, select all
      props.items.forEach((item) => {
        item.selected = true;
      });
    } else {
      // Otherwise, select only this item
      props.items.forEach((item) => {
        item.selected = item === itemToToggle;
      });
    }
  } else if (event && event.altKey) {
    // Remove the item if alt key is held
    const index = props.items.indexOf(itemToToggle);
    if (index > -1) {
      props.items.splice(index, 1);
    }
  } else {
    // Original toggle behavior
    props.items.forEach((item) => {
      if (item === itemToToggle) {
        item.selected = !item.selected;
      }
    });
  }
  emitUpdate(props.items);
};
</script>

<style scoped>
.draggable-item {
  cursor: pointer;
}
.selected {
  background-color: lightgreen;
}
</style>
