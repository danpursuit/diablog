import type { TransactionRow } from "@/types/TransactionRow";
import { ref } from "vue";

export interface DraggableTag {
  name: string;
  selected: boolean;
}

const STORAGE_KEY = "draggableTags";

const initialItems: DraggableTag[] = [
  { name: "All", selected: true },
  { name: "Memecoin", selected: false },
  { name: "AI", selected: false },
  { name: "Trump", selected: false },
];

const loadItems = () => {
  const savedItems = localStorage.getItem(STORAGE_KEY);
  const parsedItems = savedItems ? JSON.parse(savedItems) : initialItems;
  // select just "All"
  parsedItems.forEach((item: DraggableTag) => {
    item.selected = item.name === "All";
  });
  return parsedItems;
};

export const useTagsStore = () => {
  const tags = ref(loadItems());

  const saveTags = (newValue: DraggableTag[]) => {
    // make sure the first tag is always "All"
    const allTag = newValue.find((tag) => tag.name === "All");
    if (allTag) {
      newValue = newValue.filter((tag) => tag.name !== "All");
      newValue.unshift(allTag);
    } else {
      newValue.unshift({ name: "All", selected: true });
    }

    tags.value = newValue;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue));
  };

  const updateTagsFromRows = (rows: TransactionRow[]) => {
    // get all unique tags from all rows
    const uniqueTags = new Set<string>();
    rows.forEach((row) => {
      row.tags.forEach((tag) => {
        uniqueTags.add(tag);
      });
    });
    // add new tags to the list
    const newTags = Array.from(uniqueTags).filter((tag) => {
      return !tags.value.some((t: DraggableTag) => t.name === tag);
    });
    const newTagsWithSelection = newTags.map((tag) => {
      return { name: tag, selected: true };
    });
    const updatedTags = tags.value.concat(newTagsWithSelection);
    saveTags(updatedTags);
  };

  return { tags, saveTags, updateTagsFromRows };
};
