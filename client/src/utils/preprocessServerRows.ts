import { type TransactionRow } from "@/types/TransactionRow";
import { assignRowClass } from "./rowStyling.js";

// preprocess rows from SERVER only
export const preprocessServerRows = (
  rows: TransactionRow[]
): TransactionRow[] => {
  // change individual row properties
  rows.forEach((row: TransactionRow) => {
    row.finalized = true;
    assignRowClass(row);
  });
  // skip below because we expect the sort to happen from setTableRows

  // sorting on the rows as a whole
  // assignSortGroup(rows);

  // assign computed data to rows
  // computeUtils.runTableCompute(rows);
  return rows;
};
