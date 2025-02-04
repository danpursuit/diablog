import type { TableData } from "@/types/TableData";
import type { TransactionRow } from "@/types/TransactionRow";
import { recomputeRows } from "./recomputeRows";
import { addNewRow } from "./newRows";
import type { RowFilter } from "@/types/RowFilter";

const setTableRows = (
  rows: TransactionRow[],
  tableData: TableData
): TableData => {
  // update rowsOriginal
  tableData.rowsOriginal = rows;
  // call recompute()
  tableData = recomputeRows(tableData);
  return tableData;
};

const setFilters = (filters: RowFilter[], tableData: TableData): TableData => {
  // update filters
  tableData.filters = filters;
  // call recompute()
  tableData = recomputeRows(tableData);
  return tableData;
};

const toggleVisibleCompute = (tableData: TableData): TableData => {
  // toggle computeVisibleOnly
  tableData.computeVisibleOnly = !tableData.computeVisibleOnly;
  // call recompute()
  tableData = recomputeRows(tableData);
  return tableData;
};

export const SetTableData = {
  setTableRows,
  setFilters,
  toggleVisibleCompute,
  addNewRow,
  recomputeRows,
};
