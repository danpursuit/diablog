import type { TransactionRow } from "@/types/TransactionRow";
import { ref } from "vue";

export interface SelectableCoin {
  name: string;
  selected: boolean;
}

const STORAGE_KEY = "selectableCoins";

const initialItems: SelectableCoin[] = [];

const loadItems = () => {
  const savedItems = null;
  const parsedItems = savedItems ? JSON.parse(savedItems) : initialItems;
  // disable select for all coins
  parsedItems.forEach((item: SelectableCoin) => {
    item.selected = false;
  });
  return parsedItems;
};

export const useCoinsStore = () => {
  const coins = ref(loadItems());

  const saveCoins = (newValue: SelectableCoin[]) => {
    coins.value = newValue;
    console.log("newValue", newValue);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue));
  };

  const updateCoinsFromRows = (rows: TransactionRow[]) => {
    // get all new coins from inCurrency, outCurrency
    const newCoins = new Set<string>();
    const oldCoins = new Set(
      coins.value.map((coin: SelectableCoin) => coin.name)
    );
    console.log("new coins", newCoins);
    console.log("old coins", oldCoins);
    rows.forEach((row) => {
      if (row.inCurrency && !oldCoins.has(row.inCurrency)) {
        newCoins.add(row.inCurrency);
      }
      if (row.outCurrency && !oldCoins.has(row.outCurrency)) {
        newCoins.add(row.outCurrency);
      }
    });
    // add new coins to the list
    // selected should be true if any coins are currently selected, false otherwise
    const currentlyFiltering = coins.value.some(
      (coin: SelectableCoin) => coin.selected
    );
    const newCoinsWithSelection = Array.from(newCoins).map((coin) => {
      return { name: coin, selected: currentlyFiltering };
    });
    const updatedCoins = coins.value.concat(newCoinsWithSelection);
    saveCoins(updatedCoins);
  };

  return { coins, saveCoins, updateCoinsFromRows };
};
