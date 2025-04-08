import type { DateFilterValue } from "./DateTypes";
import type { RowFilter } from "./RowFilter";
import type { TransactionRow } from "./TransactionRow";

export interface TableData {
  rowsOriginal: TransactionRow[];
  rowsDisplayed: TransactionRow[];
  filters: RowFilter[];
  computeVisibleOnly: boolean;

  // stats after row compute, string: number
  netOwned: { [key: string]: number };
  netBorrowed: { [key: string]: number };
  lastTradePrices: { [key: string]: number };

  // local filters and settings
  dateRange: [DateFilterValue, DateFilterValue];
}
