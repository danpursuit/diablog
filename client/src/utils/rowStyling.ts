import { RowClassEnum, type TransactionRow } from "@/types/TransactionRow";

export const getRowClass = (row: TransactionRow) => {
  if (!row.finalized) {
    return RowClassEnum.NOT_FINALIZED;
  }
  if (row.isSubRow) {
    return RowClassEnum.SUB_ROW;
  }
  return RowClassEnum.REGULAR;
};

export const assignRowClass = (row: TransactionRow) => {
  row.rowClass = getRowClass(row);
};
