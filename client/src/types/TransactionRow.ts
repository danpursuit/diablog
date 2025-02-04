import type { RowType } from "./RowType";
import type { RowCompute } from "./CurComputeTypes";

export interface TransactionRow {
  // state management
  id: string;
  parentId: string | null;
  isSubRow: boolean;
  finalized: boolean;
  // columns
  date: string;
  rowType: RowType;
  inAmount: number | null;
  inCurrency: string | null;
  outAmount: number | null;
  outCurrency: string | null;
  feeAmount: number | "auto" | null;
  feeCurrency: string | null;
  usdValue: number | null;
  network: string;
  tags: string[];
  note: string;
  // css
  rowClass: string;
  // computed
  sortGroup: number;
  compute?: RowCompute;
}

export enum RowClassEnum {
  NOT_FINALIZED = "row-not-finalized",
  SUB_ROW = "row-sub",
  REGULAR = "row-regular",
}
