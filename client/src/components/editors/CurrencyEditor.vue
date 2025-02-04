<script lang="ts" setup>
import { ref, onMounted, nextTick } from "vue";
import type { EditorType } from "@revolist/vue3-datagrid";

// a string editor for currencies
interface CurrencyEditorProps extends EditorType {}
const props = defineProps<CurrencyEditorProps>();

const inputRef = ref<HTMLInputElement | null>(null);
const currentValue = ref(props.value);
const autocompletedTerm = ref("");

onMounted(async () => {
  await nextTick();
  if (inputRef.value) {
    inputRef.value.focus();
    inputRef.value.setSelectionRange(0, inputRef.value.value.length);
  }
});

// when typing, change local without saving yet
// also, do an autocomplete search through the searchTerms
async function handleInput(event: Event) {
  const input = event.target as HTMLInputElement;
  // skip if user hasn't typed yet
  if (!input.value) {
    currentValue.value = "";
    return;
  }

  // autocomplete
  const typedValue = input.value;
  // search for all terms that start with the typed value
  const searchTerms = props.column.column.searchTerms
    .filter(
      (term: string) =>
        term.toLowerCase().startsWith(typedValue.toLowerCase()) &&
        term.length > typedValue.length
    )
    .sort();
  // default case: do nothing
  if (!searchTerms.length) {
    autocompletedTerm.value = "";
    currentValue.value = typedValue;
    return;
  }

  // autocomplete rules like Google Sheets:
  // - fill in the rest of the word, but highlight that portion
  // - keep initial part the same (casing)
  currentValue.value = typedValue + searchTerms[0].slice(typedValue.length);
  autocompletedTerm.value = searchTerms[0];
  if (inputRef.value) {
    // in order to set the selectionrange, we need to update inputRef's value
    inputRef.value.value = currentValue.value;
    inputRef.value.setSelectionRange(typedValue.length, searchTerms[0].length);
  }
}

// on special keys, save
function handleKeyDown(event: KeyboardEvent) {
  // without autocomplete, Enter and Tab are the same.
  // However, if an autocomplete selection exists,
  // - Enter should save the user's value
  // - Tab should save the autocompleted value
  if (event.key === "Enter") {
    if (
      inputRef.value &&
      inputRef.value.selectionStart !== inputRef.value.selectionEnd
    ) {
      currentValue.value = inputRef.value.value.slice(
        0,
        inputRef.value.selectionStart as number
      );
    }
    props.save(currentValue.value);
  } else if (event.key === "Tab") {
    if (autocompletedTerm.value) currentValue.value = autocompletedTerm.value;
    props.save(currentValue.value, true);
  } else if (
    inputRef.value &&
    event.key === "Backspace" &&
    inputRef.value.selectionStart !== inputRef.value.selectionEnd
  ) {
    // if user Backspaces on autocompleted selection, we need to delete
    // - the selection
    // - an extra character
    let computedValue = inputRef.value?.value.slice(
      0,
      inputRef.value.selectionStart as number
    );
    if (computedValue.length > 0) computedValue = computedValue.slice(0, -1);
    currentValue.value = computedValue;
    inputRef.value.value = computedValue;
    autocompletedTerm.value = "";
    event.preventDefault();
  }
}
</script>

<template>
  <div class="currency-editor">
    <input
      ref="inputRef"
      :value="currentValue"
      @input="handleInput"
      @keydown="handleKeyDown" />
  </div>
</template>

<style scoped>
.currency-editor {
  width: 100%;
  height: 100%;
}

.currency-editor input {
  width: 100%;
  height: 100%;
  padding: 0 4px;
  border: none;
  outline: none;
}
</style>
