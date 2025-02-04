<script lang="ts" setup>
import { nextTick, provide, reactive, readonly, ref, watch } from "vue";
import Grid, {
  VGridVueEditor,
  VGridVueTemplate,
  type CellProps,
  type ColumnRegular,
  type Editors,
} from "@revolist/vue3-datagrid";

import NotificationSystem from "./components/notifications/NotificationSystem.vue";
import AddSubrowCell from "./components/cells/AddSubrowCell.vue";
import FinalizeCell from "./components/cells/FinalizeCell.vue";
import ComputedCurrencyCell from "./components/cells/computeCells/ComputedCurrencyCell.vue";
// editors
import FinalizeEditor from "./components/editors/FinalizeEditor.vue";
import RowTypeEditor from "./components/editors/RowTypeEditor.vue";
import CurrencyEditor from "./components/editors/CurrencyEditor.vue";
import NetworkTypeEditor from "./components/editors/NetworkTypeEditor.vue";

import { RowType } from "./types/RowType";
import { generateTransactionId } from "./utils/txId";
import { onKeyStroke } from "@vueuse/core";
import { useSubRows } from "./tableEvents/manageSubRows";
import type { TransactionRow } from "./types/TransactionRow";
import { useFinalizeRow } from "./tableEvents/finalizeRow";
import { ColumnProps } from "./types/ColumnNames";
import {
  NotificationType,
  useNotifications,
} from "./components/notifications/useNotifications";

// column types (for validation)
import { AmountColumnType } from "./components/columns/AmountColumnType";
import { FeeAmountColumnType } from "./components/columns/FeeAmountColumnType";
import { DateColumnType } from "./components/columns/DateColumnType";
import SelectColumnType from "@revolist/revogrid-column-select";

// api
import { onMounted } from "vue";
import { API, Operation } from "./api/api";
import DownloadButton from "./components/actionsHud/downloadButton.vue";
import UploadCSVButton from "./components/actionsHud/uploadCSVButton.vue";
import HudWrapper from "./components/actionsHud/hudWrapper.vue";
import UndoButton from "./components/actionsHud/undoButton.vue";
import RedoButton from "./components/actionsHud/redoButton.vue";
import FlipSwitch from "./components/actionsHud/flipSwitch.vue";
import FlexibleComputeCell from "./components/cells/computeCells/FlexibleComputeCell.vue";
import AddRowButton from "./components/addRowButton.vue";
import {
  useNetworksStore,
  type DraggableNetwork,
} from "./stores/networksStore";
import NetworkBar from "./components/blockchainBar/NetworkBar.vue";
import BarNoAdd from "./components/blockchainBar/BarNoAdd.vue";
import { type TableData } from "./types/TableData";
import { SetTableData } from "./utils/tableDataUtils/setTableData";
import { validatePropChange, validateRow } from "./utils/rowValidation";
import { preprocessServerRows } from "./utils/preprocessServerRows";
import { RowFilterType, type RowFilter } from "./types/RowFilter";
import RedIfNegativeComputeCell from "./components/cells/computeCells/RedIfNegativeComputeCell.vue";
import TagsEditor from "./components/editors/TagsEditor.vue";
import { useTagsStore, type DraggableTag } from "./stores/tagsStore";
import { usePricesStore } from "./stores/pricesStore";
import { useCategoriesStore } from "./stores/txCategoryStore";
import PricesDisplay from "./components/pricesDisplay.vue";
import { Currency } from "./utils/currencies";
import NetWorthDisplay from "./components/netWorthDisplay.vue";
import FlipPnlSwitch from "./components/actionsHud/flipPnlSwitch.vue";
import NumberSumWidget from "./components/NumberSumWidget.vue";
import AutocompleteBar from "./components/autocompleteBar/AutocompleteBar.vue";
import { useCoinsStore, type SelectableCoin } from "./stores/coinsStore";

// Add ref for storing deleted rows
const deletedRows = ref<TransactionRow[]>([]);

const columnTypes = {
  // numeric: new NumberColumnType("0,0.0[0000]"),
  numeric: new AmountColumnType("0,0.0[0000]"),
  feeNumeric: new FeeAmountColumnType("0,0.0[000000]"),
  dateColumn: new DateColumnType(),
  selectColumn: new SelectColumnType(),
};

const ROW_TYPE_EDITOR = "row-type-editor";
const FINALIZE_EDITOR = "finalize-editor";
const CURRENCY_EDITOR = "currency-editor";
const NETWORK_TYPE_EDITOR = "network-type-editor";
const TAG_EDITOR = "tag-editor";

// Vue column editor register
const gridEditors: Editors = {
  [ROW_TYPE_EDITOR]: VGridVueEditor(RowTypeEditor),
  [FINALIZE_EDITOR]: VGridVueEditor(FinalizeEditor),
  [CURRENCY_EDITOR]: VGridVueEditor(CurrencyEditor),
  [NETWORK_TYPE_EDITOR]: VGridVueEditor(NetworkTypeEditor),
  [TAG_EDITOR]: VGridVueEditor(TagsEditor),
};
// currency params; automate later
// let currencySearchTerms: string[] = [];
// let feeSearchTerms: string[] = ["ETH"];

//////////////////////////////
// REFs
//////////////////////////////
// refactoring tableRows to a TableData object
// const tableRows = ref<TransactionRow[]>([]);
const tableData = reactive<TableData>({
  rowsOriginal: [],
  rowsDisplayed: [],
  filters: [],
  computeVisibleOnly: true,
  netOwned: {},
  netBorrowed: {},
  lastTradePrices: {},
});
// Search terms for currency and fee columns
const currencySearchTerms = ref<string[]>([]);
const feeSearchTerms = ref<string[]>(["ETH"]);
// Undo/Redo strings for HUD buttons
const undoMsg = ref<string>("");
const redoMsg = ref<string>("");
// Track the currently selected cell
const selectedCell = ref<{ x: number; y: number } | null>(null);
// Rerender networth display
const rerenderNetworth = ref(0);
// Rerender networks bar
const rerenderNetworks = ref(0);
// Rerender tags bar
const rerenderTags = ref(0);
// Rerender table
const rerenderTable = ref(0);
const rerenderCategories = ref(0);

//////////////////////////////
// STOREs
//////////////////////////////
// for draggable networks
const { networks, saveNetworks } = useNetworksStore();
const networkList = networks.value.map(
  (network: DraggableNetwork) => network.name
);
// for draggable tags
const { tags, saveTags, updateTagsFromRows } = useTagsStore();
// tagList are selectable tags; skip "All" tag
// const tagList = tags.value
//   .map((tag: DraggableTag) => tag.name)
//   .filter((tag: string) => tag !== "All");
// for manual Prices
const { manualPrices, updatePrice } = usePricesStore();
const { categories, saveCategories } = useCategoriesStore();
const { coins, saveCoins, updateCoinsFromRows } = useCoinsStore();

//////////////////////////////
// FLIP computed coin columns
//////////////////////////////
// flip coins in compute cells displayed
const flippedCoins = ref(false);
const handleFlip = (newState: boolean) => {
  console.log("flippin coins", newState);
  flippedCoins.value = newState;
};

//////////////////////////////
// Column definitions
//////////////////////////////
const columns = [
  // { prop: "id", name: "ID", size: 300, },
  {
    prop: ColumnProps.FINALIZED,
    // name: "✅/❌",
    size: 35,
    editor: FINALIZE_EDITOR,
    cellTemplate: VGridVueTemplate(FinalizeCell),
    readonly: true,
  },
  {
    prop: ColumnProps.ACTIONS,
    name: "",
    cellTemplate: VGridVueTemplate(AddSubrowCell),
    readonly: true,
    size: 30,
  },
  {
    prop: ColumnProps.DATE,
    name: "Date",
    // editor: DATETIME_EDITOR,
    columnType: "dateColumn",
    size: 105,
  },
  {
    prop: ColumnProps.ROW_TYPE,
    name: "Row Type",
    editor: ROW_TYPE_EDITOR,
    // columnType: "selectColumn",
    // ...dropdown,
  },
  {
    prop: ColumnProps.IN_AMOUNT,
    name: "In Amount",
    columnType: "numeric",
  },
  {
    prop: ColumnProps.IN_CURRENCY,
    name: "In Currency",
    editor: CURRENCY_EDITOR,
    // important note to self: custom properties like searchTerms straight up go here
    searchTerms: currencySearchTerms.value,
  },
  {
    prop: ColumnProps.OUT_AMOUNT,
    name: "Out Amount",
    columnType: "numeric",
  },
  {
    prop: ColumnProps.OUT_CURRENCY,
    name: "Out Currency",
    editor: CURRENCY_EDITOR,
    searchTerms: currencySearchTerms.value,
  },
  {
    prop: ColumnProps.FEE_AMOUNT,
    name: "Fee Amount",
    columnType: "feeNumeric",
  },
  {
    prop: ColumnProps.FEE_CURRENCY,
    name: "Fee Currency",
    editor: CURRENCY_EDITOR,
    searchTerms: feeSearchTerms.value,
    size: 90,
  },
  {
    prop: ColumnProps.USD_VALUE,
    name: "USD Value",
    columnType: "numeric",
    size: 80,
  },
  {
    prop: ColumnProps.NETWORK,
    name: "Chain",
    editor: NETWORK_TYPE_EDITOR,
    size: 105,
    searchTerms: networkList,
  },
  {
    prop: ColumnProps.TAGS,
    name: "Tags",
    editor: TAG_EDITOR,
    // searchTerms: tagList,
    searchTerms: tags,
    // editor: NETWORK_TYPE_EDITOR,
    // size: 105,
    // searchTerms: networkList,
  },
  {
    prop: ColumnProps.COMPUTED,
    name: "Price",
    readonly: true,
    cellTemplate: VGridVueTemplate(FlexibleComputeCell),
    flippedCoins: flippedCoins,
    computeProperty: "price",
  },
  {
    prop: ColumnProps.COMPUTED,
    name: "Avg Buy Price",
    readonly: true,
    // cellTemplate: VGridVueTemplate(ComputedAvgPriceCell),
    cellTemplate: VGridVueTemplate(FlexibleComputeCell),
    flippedCoins: flippedCoins,
    computeProperty: "avgPrice",
  },
  {
    prop: ColumnProps.COMPUTED,
    name: "+PNL ($)",
    readonly: true,
    // cellTemplate: VGridVueTemplate(ComputedPnlCell),
    cellTemplate: VGridVueTemplate(FlexibleComputeCell),
    flippedCoins: flippedCoins,
    computeProperty: "pnl",
    numberFormat: "0,0.0[00]",
  },
  {
    prop: ColumnProps.COMPUTED,
    name: "total PNL",
    readonly: true,
    // cellTemplate: VGridVueTemplate(ComputedCumPnlCell),
    cellTemplate: VGridVueTemplate(FlexibleComputeCell),
    flippedCoins: flippedCoins,
    computeProperty: "cumPnl",
    numberFormat: "0,0.0[00]",
  },
  {
    prop: ColumnProps.COMPUTED,
    name: "# Owned",
    readonly: true,
    // cellTemplate: VGridVueTemplate(ComputedCumAmountCell),
    // cellTemplate: VGridVueTemplate(FlexibleComputeCell),
    cellTemplate: VGridVueTemplate(RedIfNegativeComputeCell),
    flippedCoins: flippedCoins,
    computeProperty: "cumAmount",
    numberFormat: "0,0.0[000000]",
  },
  {
    prop: ColumnProps.COMPUTED,
    name: "# Borrowed",
    readonly: true,
    // cellTemplate: VGridVueTemplate(ComputedCumAmountCell),
    // cellTemplate: VGridVueTemplate(FlexibleComputeCell),
    cellTemplate: VGridVueTemplate(RedIfNegativeComputeCell),
    flippedCoins: flippedCoins,
    computeProperty: "amountBorrowed",
    numberFormat: "0,0.0[000000]",
  },
  // # in Chain can be substituted with "visiblePNL only" + filter by that chain
  // however, it's important to check if amount owned < 0 on that chain since that is usually an error
  {
    prop: ColumnProps.COMPUTED,
    name: "# (in Chain)",
    readonly: true,
    cellTemplate: VGridVueTemplate(RedIfNegativeComputeCell),
    flippedCoins: flippedCoins,
    computeProperty: "amountInNetwork",
    numberFormat: "0,0.0[000000]",
  },
  {
    prop: ColumnProps.COMPUTED,
    name: "PNL Currency",
    readonly: true,
    cellTemplate: VGridVueTemplate(ComputedCurrencyCell),
    flippedCoins: flippedCoins,
  },
  {
    prop: ColumnProps.NOTE,
    name: "Note",
    size: 200,
  },
];
//////////////////////////////
// Constants for column IDX of note
//////////////////////////////
const colIdx_actions = columns.findIndex(
  (column) => column.prop === ColumnProps.ACTIONS
);
const colIdx_finalized = columns.findIndex(
  (column) => column.prop === ColumnProps.FINALIZED
);

//////////////////////////////
// Wrappers for SetTableRow calls
//////////////////////////////
const setTableRows = (rows: TransactionRow[]) => {
  const newTableData = SetTableData.setTableRows(rows, tableData);
  tableData.rowsOriginal = newTableData.rowsOriginal;
  tableData.rowsDisplayed = [...newTableData.rowsDisplayed]; // force rerender
  // need to copy stats
  tableData.netOwned = { ...newTableData.netOwned };
  tableData.netBorrowed = { ...newTableData.netBorrowed };
  tableData.lastTradePrices = { ...newTableData.lastTradePrices };
  updateCoinsFromRows(rows);
};
const setTableRowsFromServer = (rows: TransactionRow[]) => {
  rows = preprocessServerRows(rows);
  setTableRows(rows);
  updateTagsFromRows(rows);
  updateCoinsFromRows(rows);
};
const setTableFilters = (filters: RowFilter[]) => {
  const newTableData = SetTableData.setFilters(filters, tableData);
  tableData.filters = newTableData.filters;
  tableData.rowsDisplayed = [...newTableData.rowsDisplayed];
  // need to copy stats
  tableData.netOwned = { ...newTableData.netOwned };
  tableData.netBorrowed = { ...newTableData.netBorrowed };
  tableData.lastTradePrices = { ...newTableData.lastTradePrices };
};
const toggleVisibleCompute = () => {
  console.log("toggling visible compute");
  const newTableData = SetTableData.toggleVisibleCompute(tableData);
  tableData.computeVisibleOnly = newTableData.computeVisibleOnly;
  tableData.rowsDisplayed = [...newTableData.rowsDisplayed];
  // need to copy stats
  tableData.netOwned = { ...newTableData.netOwned };
  tableData.netBorrowed = { ...newTableData.netBorrowed };
  tableData.lastTradePrices = { ...newTableData.lastTradePrices };
};
const recomputeTableOnly = () => {
  const newTableData = SetTableData.recomputeRows(tableData);
  tableData.rowsDisplayed = newTableData.rowsDisplayed;
  // need to copy stats
  tableData.netOwned = { ...newTableData.netOwned };
  tableData.netBorrowed = { ...newTableData.netBorrowed };
  tableData.lastTradePrices = { ...newTableData.lastTradePrices };
};
const addNewRowOnly = async () => {
  const newTableData = SetTableData.addNewRow(tableData);
  tableData.rowsDisplayed = [...newTableData.rowsDisplayed];
  tableData.lastTradePrices = { ...newTableData.lastTradePrices };
};

//////////////////////////////
// Set Undo/Redo message on HUD buttons
// Important! Done after API calls that change table
//////////////////////////////
const setUndoRedo = (undo: string, redo: string) => {
  undoMsg.value = undo;
  redoMsg.value = redo;
  // whenever this is called, we need to reSort the table
  // because setUndoRedo implies the table has changed (except initial server loadRows, where value is empty anyway)
  recomputeTableOnly();
};

// Handle changing Draggable Networks
const updateNetworks = (newNetworks: DraggableNetwork[]) => {
  saveNetworks(newNetworks);
  rerenderNetworks.value++;

  // update tableData.filters
  const oldFilters = tableData.filters.filter(
    (filter) => filter.filterType !== RowFilterType.includeNetwork
  );
  // for each DraggableNetwork that has selected: false, add a filter to ignore that network
  const newFilters = newNetworks
    .filter((network) => network.selected)
    .map(
      (network): RowFilter => ({
        filterType: RowFilterType.includeNetwork,
        value: network.name,
      })
    );
  // if all filters are selected, remove all filters
  if (newFilters.length === newNetworks.length) {
    setTableFilters([...oldFilters]);
    return;
  }
  setTableFilters([...oldFilters, ...newFilters]);
};
// Handle changing Draggable Tags
const updateTags = (newValue: DraggableTag[]) => {
  saveTags(newValue);
  rerenderTags.value++;

  // update tableData.filters
  const oldFilters = tableData.filters.filter(
    (filter) => filter.filterType !== RowFilterType.includeTag
  );
  // for each DraggableNetwork that has selected: false, add a filter to ignore that network
  const newFilters = newValue
    .filter((tag) => tag.selected)
    .map(
      (tag): RowFilter => ({
        filterType: RowFilterType.includeTag,
        value: tag.name,
      })
    );
  // if all filters are selected, remove all filters
  if (newFilters.length === newValue.length) {
    setTableFilters([...oldFilters]);
    return;
  }
  setTableFilters([...oldFilters, ...newFilters]);
};
// Handle changing Draggable Categories
const updateCategories = (newValue: DraggableTag[]) => {
  saveCategories(newValue);
  rerenderCategories.value++;

  // update tableData.filters
  const oldFilters = tableData.filters.filter(
    (filter) => filter.filterType !== RowFilterType.byCategory
  );
  // for each DraggableNetwork that has selected: false, add a filter to ignore that network
  const newFilters = newValue
    .filter((cat) => cat.selected)
    .map(
      (cat): RowFilter => ({
        filterType: RowFilterType.byCategory,
        value: cat.name,
      })
    );
  // if all filters are selected, remove all filters
  if (newFilters.length === newValue.length) {
    setTableFilters([...oldFilters]);
    return;
  }
  setTableFilters([...oldFilters, ...newFilters]);
};
// handle selectable Coins
const updateCoins = (newValue: SelectableCoin[]) => {
  saveCoins(newValue);

  // update tableData.filters
  const oldFilters = tableData.filters.filter(
    (filter) => filter.filterType !== RowFilterType.includeCoin
  );
  // for each selectableCoin that has selected: true, add a filter to include that coin
  const newFilters = newValue
    .filter((coin) => coin.selected)
    .map(
      (coin): RowFilter => ({
        filterType: RowFilterType.includeCoin,
        value: coin.name,
      })
    );
  setTableFilters([...oldFilters, ...newFilters]);
};

//////////////////////////////
// Event - Update focused cell
//////////////////////////////
const handleFocus = (e: CustomEvent) => {
  const { x, y } = e.detail.focus;
  selectedCell.value = { x, y };
};

//////////////////////////////
// import table event handlers
//////////////////////////////
const { addNotification, notifications, removeNotification } =
  useNotifications();
const { addSubRow } = useSubRows({ tableData });
const { handleFinalize } = useFinalizeRow({
  tableData,
  deletedRows,
  addNotification,
  setUndoRedo,
  setTableRows,
});

//////////////////////////////
// On Creation, fetch transactions from server
//////////////////////////////
onMounted(async () => {
  try {
    const newRows = await API.fetchTransactions(setUndoRedo);
    setTableRowsFromServer(newRows);
    addNotification("Transactions loaded from server", NotificationType.INFO);
  } catch (error) {
    addNotification(
      "Failed to load transactions from server",
      NotificationType.ERROR
    );
    throw error;
  }
});

// Function to handle when editing starts
function handleBeforeEdit(e: CustomEvent) {
  // auto-add a new row to bottom if editing last row
  // const rowIndex = e.detail?.rowIndex;
  // if (rowIndex === tableData.rowsDisplayed.length - 1) {
  //   addNewRowOnly();
  // }
}

// Function to handle when a cell value changes
async function handleAfterEdit(e: CustomEvent) {
  try {
    // there are several different custom events that trigger after edit.
    // first one is a single cell edit
    const { prop, rowIndex, val } = e.detail;
    const row = tableData.rowsDisplayed[rowIndex];
    if (row) {
      const { valid, reason } = validatePropChange(row, prop);
      if (!valid) {
        addNotification(
          "Error with your change: " + reason,
          NotificationType.ERROR
        );
        return;
      }
      if (row.finalized) {
        await API.updateTransaction(Operation.update, row, setUndoRedo);
      }
    }

    // next one is a paste; can be multi-row
    const { data, models } = e.detail;
    if (data && models) {
      for (const [rowIndex, modifiedData] of Object.entries(data)) {
        const row = tableData.rowsDisplayed[parseInt(rowIndex)];
        if (row) {
          for (const [prop, val] of Object.entries(
            modifiedData as Map<string, any>
          )) {
            validatePropChange(row, prop);
          }
        }
        const { valid, reason } = validateRow(row);
        if (!valid) {
          addNotification(
            "Error with your change: " + reason,
            NotificationType.ERROR
          );
        } else {
          if (row.finalized) {
            await API.updateTransaction(Operation.update, row, setUndoRedo);
          }
        }
      }
    }
    // auto-add a new row to bottom if editing last row
    if (rowIndex === tableData.rowsDisplayed.length - 1) {
      addNewRowOnly();
    }
  } catch (error) {
    addNotification("Failed to update transaction", NotificationType.ERROR);
    // raise error
    throw error;
  }
}

// handle when a row is finalized (save or delete)
const handleFinalizeEvent = (e: CustomEvent) => {
  const rowId = e.detail.rowId;
  handleFinalize(rowId);
};

// handle when a parent row triggers adding a sub-row
const handleAddSubRow = (e: CustomEvent) => {
  const rowId = e.detail.rowId;
  addSubRow(rowId);
};

// track keystrokes
onKeyStroke("Enter", (e) => {
  // check if the selected cell is in the finalized column
  if (selectedCell.value?.x === colIdx_finalized) {
    const rowId = tableData.rowsDisplayed[selectedCell.value.y].id;
    handleFinalize(rowId);
    e.preventDefault();
  } else if (selectedCell.value?.x === colIdx_actions) {
    const rowId = tableData.rowsDisplayed[selectedCell.value.y].id;
    addSubRow(rowId);
    e.preventDefault();
  }
});

// on keyDown, call preventDefault if we are trying to undo/redo
const handleBeforeKeyDown = (e: CustomEvent) => {
  const event = e.detail.original as KeyboardEvent;
  const target = e.target as HTMLElement;
  if (event.key === "z" || event.key === "y") {
    // undo/redo
    if ((event.metaKey || event.ctrlKey) && !event.shiftKey) {
      // command key
      if (target.tagName !== "INPUT") {
        // not in input
        e.preventDefault();
      }
    }
  }
};

// Watch for changes in tableRows
watch(
  () => tableData.rowsOriginal,
  (newData) => {
    // update different Currencies in currencySearchTerms
    for (const row of newData) {
      if (
        row.inCurrency &&
        !currencySearchTerms.value.includes(row.inCurrency)
      ) {
        currencySearchTerms.value.push(row.inCurrency);
      }
      if (
        row.outCurrency &&
        !currencySearchTerms.value.includes(row.outCurrency)
      ) {
        currencySearchTerms.value.push(row.outCurrency);
      }
      if (row.feeCurrency && !feeSearchTerms.value.includes(row.feeCurrency)) {
        feeSearchTerms.value.push(row.feeCurrency);
      }
    }
  },
  { deep: true }
);
</script>

<template>
  <div class="flex flex-col w-full">
    <NetWorthDisplay
      :key="rerenderNetworth"
      :manualPrices="manualPrices"
      :tableData="tableData" />
    <PricesDisplay
      :tableData="tableData"
      :manualPrices="manualPrices"
      :updateManualPrice="updatePrice" />
    <HudWrapper>
      <UndoButton
        :msg="undoMsg"
        :setUndoRedo="setUndoRedo"
        @set-rows="setTableRowsFromServer" />
      <RedoButton
        :msg="redoMsg"
        :setUndoRedo="setUndoRedo"
        @set-rows="setTableRowsFromServer" />
      <!-- switch to toggle fullPNL vs visiblePNL only -->
      <FlipSwitch
        :flipped="!tableData.computeVisibleOnly"
        @flipped="toggleVisibleCompute"
        label="Full PNL" />
      <!-- switch to toggle primary coin PNL vs secondary -->
      <FlipPnlSwitch
        :flipped="flippedCoins"
        @flip-pnl="handleFlip"
        label="Flip PNL" />
      <DownloadButton />
      <UploadCSVButton
        :setUndoRedo="setUndoRedo"
        :addNotification="addNotification"
        @upload-success="setTableRowsFromServer" />
    </HudWrapper>
    <Grid
      :key="rerenderTable"
      :range="true"
      :editors="gridEditors"
      :source="tableData.rowsDisplayed"
      :columns="columns"
      :columnTypes="columnTypes"
      rowClass="rowClass"
      :can-move-columns="true"
      @beforeedit="handleBeforeEdit"
      @afteredit="handleAfterEdit"
      @add-sub-row="handleAddSubRow"
      @finalize-row="handleFinalizeEvent"
      @beforekeydown="handleBeforeKeyDown"
      @focuscell="handleFocus" />
    <AddRowButton :action="addNewRowOnly">Add New Row</AddRowButton>
    <NetworkBar
      :name="`Network`"
      :items="networks"
      :rerender-num="rerenderNetworks"
      @update:items="updateNetworks" />
    <NetworkBar
      :name="`Tag`"
      :items="tags"
      :rerender-num="rerenderTags"
      @update:items="updateTags" />
    <BarNoAdd
      :name="`Categorie`"
      :items="categories"
      :rerender-num="rerenderCategories"
      @update:items="updateCategories" />
    <AutocompleteBar
      :name="`Coin`"
      :items="coins"
      @update:items="updateCoins" />
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NumberSumWidget />
        <NumberSumWidget />
        <NumberSumWidget />
      </div>
    </div>
  </div>
  <NotificationSystem
    :notifications="notifications"
    :removeNotification="removeNotification" />
</template>
