import type { TransactionRow } from "@/types/TransactionRow";
import { ref } from "vue";

export interface DraggableCat {
  name: string;
  selected: boolean;
}

const initialItems: DraggableCat[] = [
  { name: "All", selected: true },
  { name: "Trades", selected: false },
  { name: "Loans", selected: false },
];

const loadItems = () => {
  return initialItems;
};

export const useCategoriesStore = () => {
  const cats = ref(loadItems());

  const saveCategories = (newValue: DraggableCat[]) => {
    // make sure the first tag is always "All"
    const allCat = newValue.find((cat) => cat.name === "All");
    if (allCat) {
      newValue = newValue.filter((cat) => cat.name !== "All");
      newValue.unshift(allCat);
    } else {
      newValue.unshift({ name: "All", selected: true });
    }

    cats.value = newValue;
  };

  return { categories: cats, saveCategories };
};
