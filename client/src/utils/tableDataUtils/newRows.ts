import type { TransactionRow } from "@/types/TransactionRow";
import { generateTransactionId } from "../txId";
import { formatDate } from "../dateUtils";
import { RowType } from "@/types/RowType";
import { RowClassEnum } from "@/types/TransactionRow";
import type { TableData } from "@/types/TableData";

export const newRow = (
  feeCurrency: string | null = "",
  network: string = "",
  tags: string[] = []
): TransactionRow => {
  const emptyRow: TransactionRow = {
    id: generateTransactionId(),
    parentId: null,
    finalized: false,
    date: formatDate(new Date()),
    rowType: RowType.TRADE,
    inAmount: null,
    inCurrency: "",
    outAmount: null,
    outCurrency: "",
    feeAmount: "auto",
    feeCurrency: feeCurrency,
    usdValue: null,
    network: network,
    tags: tags,
    note: "",
    isSubRow: false,
    rowClass: RowClassEnum.NOT_FINALIZED,
    sortGroup: Infinity,
  };
  return emptyRow;
};

export const newSubRow = (
  parentRow: TransactionRow,
  initialRowType: RowType
): TransactionRow => {
  // if (!initialRowType) {
  //   initialRowType = RowType.subEXTRAOUT;
  // }

  const emptyRow: TransactionRow = {
    ...newRow("", parentRow.network),
    feeAmount: null, // by default, sub row doesn't need fee
    isSubRow: true,
    rowType: initialRowType,
    date: parentRow.date,
    parentId: parentRow.id,
  };

  // default parameters for sub row types
  // if (initialRowType === RowType.subEXTRAOUT) {
  //   // add some default values to out
  //   emptyRow.outAmount = 0;
  //   emptyRow.outCurrency = "USDC";
  // }

  return emptyRow;
};

export const addNewRow = (tableData: TableData): TableData => {
  const rows = tableData.rowsDisplayed;
  // data to copy from last row
  const feeCurency = rows.length > 0 ? rows[rows.length - 1].feeCurrency : "";
  const network = rows.length > 0 ? rows[rows.length - 1].network : "";
  const tags = rows.length > 0 ? rows[rows.length - 1].tags : [];
  if (!feeCurency || !network) {
    console.log("addNewRow: feeCurency or network is empty", rows);
  }
  // new rows go to bottom of rowsDisplayed
  tableData.rowsDisplayed.push(newRow(feeCurency, network, tags));
  // no recompute
  return tableData;
};
