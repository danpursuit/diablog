import type { TableData } from "@/types/TableData.ts";
import type { TransactionRow } from "@/types/TransactionRow.ts";
import { runTableCompute } from "./compute/runCompute.ts";
import { addNewRow } from "./newRows.ts";
import { RowFilterType } from "@/types/RowFilter.ts";
import { postcomputeStats } from "./compute/postcomputeStats.ts";
import { RowType } from "@/types/RowType.ts";

// recompute Rows (recompute rowsDisplayed)
// - skip if rowsOriginal not loaded yet
// - set state of rowsDisplayed based on other details
// - handle non-finalized rows
// - make sure to save all non-finalized rows
// - if there are none, add one
// - sort() and compute() AFTER non-finalized rows are handled

// helper: sort the rows
const _assignSortGroup = (rows: TransactionRow[]): void => {
  // sort by date (most important), then by id
  rows.sort((a, b) => {
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    if (a.id < b.id) return -1;
    if (a.id > b.id) return 1;
    return 0;
  });

  // assign sortGroup number
  let numParents = 0;
  const parentToNext: { [key: string]: number } = {};
  const subIncrement = 0.000001;
  const isParents: { [key: string]: boolean } = {};

  // prepass, get all parents
  for (const row of rows) {
    if (row.parentId !== null) continue;
    isParents[row.id] = true;
  }

  // first pass, parents only
  for (const row of rows) {
    if (row.parentId !== null) {
      // is a subrow
      // if parent doesn't exist, still keep it
      if (isParents[row.parentId]) {
        continue;
      }
    }
    numParents++;
    row.sortGroup = numParents;
    parentToNext[row.id] = numParents + subIncrement;
  }

  // second pass, children
  for (const row of rows) {
    if (row.parentId === null) continue;
    if (parentToNext[row.id]) continue; // skip subrows handled in last step
    const parentId = row.parentId;
    if (!parentToNext[parentId]) {
      throw new Error(`Parent row not found for row ${row.id} ${row}`);
    } else {
      row.sortGroup = parentToNext[parentId];
      parentToNext[parentId] += subIncrement;
    }
  }
  rows.sort(
    (a: TransactionRow, b: TransactionRow) => a.sortGroup - b.sortGroup
  );
};

// helper: run the compute
const _assignComputeData = (rows: TransactionRow[]): void => {
  runTableCompute(rows);
};

const _postcomputeStats = (tableData: TableData): TableData => {
  return postcomputeStats(tableData);
};

export const recomputeRows = (tableData: TableData): TableData => {
  // skip if rowsOriginal not loaded yet
  if (!tableData.rowsOriginal) return tableData;

  // compute PNL first if !computeVisibleOnly
  if (!tableData.computeVisibleOnly) {
    _assignSortGroup(tableData.rowsOriginal);
    _assignComputeData(tableData.rowsOriginal);
  }

  // before filter:
  // filter out non-finalized rows (we will add all of them back after filtering)
  let rowsDisplayed = tableData.rowsOriginal.filter((row) => row.finalized);

  // filter the rows out
  // network: filter if we have any includeNetwork filters
  const networkFilters = tableData.filters.filter(
    (filter) => filter.filterType === RowFilterType.includeNetwork
  );
  if (networkFilters.length > 0) {
    rowsDisplayed = rowsDisplayed.filter((row) => {
      return networkFilters.some((filter) => filter.value === row.network);
    });
  }
  // tag: filter if we have any includeTag filters, and "All" tag is not selected
  const tagFilters = tableData.filters.filter(
    (filter) => filter.filterType === RowFilterType.includeTag
  );
  if (
    tagFilters.length > 0 &&
    !tagFilters.some((filter) => filter.value === "All")
  ) {
    rowsDisplayed = rowsDisplayed.filter((row) => {
      return tagFilters.some((filter) => row.tags.includes(filter.value));
    });
  }
  // category: filter if we have any byCategory filters, and "All" category is not selected
  const categoryFilters = tableData.filters.filter(
    (filter) => filter.filterType === RowFilterType.byCategory
  );
  if (
    categoryFilters.length > 0 &&
    !categoryFilters.some((filter) => filter.value === "All")
  ) {
    const allowTrade = categoryFilters.some(
      (filter) => filter.value === "Trades"
    );
    const allowLoan = categoryFilters.some(
      (filter) => filter.value === "Loans"
    );
    rowsDisplayed = rowsDisplayed.filter((row) => {
      if (
        allowTrade &&
        (row.rowType === RowType.TRADE || row.rowType === RowType.subREBUY)
      ) {
        return true;
      }
      if (
        allowLoan &&
        (row.rowType === RowType.BORROW ||
          row.rowType === RowType.REPAY ||
          row.rowType === RowType.subPRINCIPLE ||
          row.rowType === RowType.subINTEREST)
      ) {
        return true;
      }
      return false;
    });
  }
  // coin: filter if we have any includeCoin filters
  const coinFilters = tableData.filters.filter(
    (filter) => filter.filterType === RowFilterType.includeCoin
  );
  if (coinFilters.length > 0) {
    rowsDisplayed = rowsDisplayed.filter((row) => {
      return coinFilters.some(
        (filter) =>
          row.inCurrency === filter.value || row.outCurrency === filter.value
      );
    });
  }

  // post-filter: add the non-finalized rows
  const rowsInProgress = tableData.rowsDisplayed.filter(
    (row) => !row.finalized
  );
  rowsDisplayed.push(...rowsInProgress);

  // sort the rows
  _assignSortGroup(rowsDisplayed);

  // compute PNL if computeVisibleOnly
  if (tableData.computeVisibleOnly) {
    _assignComputeData(rowsDisplayed);
  }

  tableData = { ...tableData, rowsDisplayed };
  tableData = { ...tableData, ..._postcomputeStats(tableData) };
  // wrapping up: if there are no non-finalized rows, add one
  // rowsDisplayed length check is to prevent initial add before rows are loaded
  if (rowsInProgress.length === 0 && rowsDisplayed.length > 0) {
    addNewRow(tableData);
  }

  return tableData;
};
