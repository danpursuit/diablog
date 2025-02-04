import { ref } from "vue";

export interface DraggableNetwork {
  name: string;
  selected: boolean;
}

const STORAGE_KEY = "draggableNetworks";

const initialItems: DraggableNetwork[] = [
  { name: "Solana", selected: true },
  { name: "Ethereum", selected: true },
  { name: "Base", selected: true },
];

const loadItems = () => {
  const savedItems = localStorage.getItem(STORAGE_KEY);
  const parsedItems = savedItems ? JSON.parse(savedItems) : initialItems;
  // select all
  parsedItems.forEach((item: DraggableNetwork) => {
    item.selected = true;
  });
  return parsedItems;
};

export const useNetworksStore = () => {
  const networks = ref(loadItems());

  const saveNetworks = (newNetworks: DraggableNetwork[]) => {
    networks.value = newNetworks;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newNetworks));
  };

  return { networks, saveNetworks };
};
