<template>
  <div class="full-width-button-container">
    <button class="full-width-button" @click="onClick">
      <slot>Click Me</slot>
    </button>
  </div>
</template>

<script>
export default {
  name: "AddRowButton",
  props: {
    action: {
      type: Function,
      required: true,
    },
  },
  methods: {
    onClick() {
      this.action();
    },
  },
};
</script>

<style scoped>
.full-width-button-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 16px;
}

.full-width-button {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  font-weight: bold;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.full-width-button:hover {
  background-color: #45a049;
}
</style>
