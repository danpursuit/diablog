import { ref } from "vue";

export interface ManualPrices {
  [symbol: string]: number;
}

const STORAGE_KEY = "manualPrices";

const loadItems = () => {
  const savedItems = localStorage.getItem(STORAGE_KEY);
  const parsedItems = savedItems ? JSON.parse(savedItems) : {};
  return parsedItems;
};

export const usePricesStore = () => {
  const manualPrices = ref(loadItems());

  const updatePrice = (symbol: string, price: number) => {
    manualPrices.value[symbol] = price;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(manualPrices.value));
  };
  return { manualPrices, updatePrice };
};
