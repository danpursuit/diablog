<script setup>
import { ref } from "vue";
import { Draggable } from "gsap/Draggable";
import { gsap } from "gsap";

// Register GSAP Draggable plugin
gsap.registerPlugin(Draggable);

// Initial list of elements
const items = ref(["A", "B", "C", "D", "E"]);

// Selected items tracking
const selectedItems = ref(new Set());

// Handle item click with optional command key modifier
const handleItemClick = (item, event) => {
  if (event.metaKey || event.ctrlKey) {
    // If command/ctrl key is pressed
    if (selectedItems.value.size === items.value.length) {
      // If all items are selected, deselect all
      selectedItems.value.clear();
    } else if (selectedItems.value.has(item)) {
      // If this item is selected, select only this item
      selectedItems.value.clear();
      selectedItems.value.add(item);
    } else {
      // Deselect all and select this item
      selectedItems.value.clear();
      selectedItems.value.add(item);
    }
  } else {
    // Normal click behavior
    if (selectedItems.value.has(item)) {
      selectedItems.value.delete(item);
    } else {
      selectedItems.value.add(item);
    }
  }
};

// Drag and drop functionality
const onDragEnd = (evt) => {
  const { oldIndex, newIndex } = evt;
  const movedItem = items.value.splice(oldIndex, 1)[0];
  items.value.splice(newIndex, 0, movedItem);
};
</script>

<template>
  <div class="draggable-list">
    <div
      v-for="(item, index) in items"
      :key="item"
      class="draggable-item"
      :class="{ selected: selectedItems.has(item) }"
      @click="handleItemClick(item, $event)"
      v-drag-and-drop:item="{ onDragEnd }">
      {{ item }}
    </div>
  </div>
</template>

<style scoped>
.draggable-list {
  display: flex;
  gap: 10px;
}

.draggable-item {
  padding: 10px 15px;
  background-color: #f0f0f0;
  cursor: move;
  transition: background-color 0.3s ease;
}

.draggable-item.selected {
  background-color: #a0a0a0;
}

.draggable-item:hover {
  background-color: #d0d0d0;
}
</style>
