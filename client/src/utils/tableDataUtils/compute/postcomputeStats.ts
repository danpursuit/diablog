import type { TableData } from "@/types/TableData";
import { Currency } from "@/utils/currencies";

export const postcomputeStats = (tableData: TableData): TableData => {
  // last trade prices
  const lastTradePrices: { [key: string]: number } = {};
  tableData.rowsDisplayed.forEach((row) => {
    if (!row.finalized || row.isSubRow) {
      return;
    }
    if (row.inCurrency && row.inAmount && row.usdValue) {
      lastTradePrices[row.inCurrency] = row.usdValue / row.inAmount;
    }
    if (row.outCurrency && row.outAmount && row.usdValue) {
      lastTradePrices[row.outCurrency] = row.usdValue / row.outAmount;
    }
  });
  // remove all prices that are in stable
  Currency.stable.forEach((stable) => {
    delete lastTradePrices[stable];
  });
  console.log("lastTradePrices", lastTradePrices);

  // new netOwned
  const netOwned: { [key: string]: number } = {};
  // loop through rows chronologically
  tableData.rowsDisplayed.forEach((row) => {
    if (!row.finalized) {
      return;
    }
    if (row.compute?.curs) {
      row.compute.curs.forEach((cur) => {
        // get the amount owned
        const amountOwned = row.compute?.curData[cur]?.netAmount;
        if (amountOwned !== undefined && amountOwned !== null) {
          netOwned[cur] = amountOwned;
        }
      });
    }
  });
  // new netBorrowed
  const netBorrowed: { [key: string]: number } = {};
  tableData.rowsDisplayed.forEach((row) => {
    if (!row.finalized) {
      return;
    }
    if (row.compute?.curs) {
      row.compute.curs.forEach((cur) => {
        const amountBorrowed = row.compute?.curData[cur]?.amountBorrowed;
        if (amountBorrowed !== undefined && amountBorrowed !== null) {
          netBorrowed[cur] = amountBorrowed;
        }
      });
    }
  });
  return {
    ...tableData,
    netOwned,
    netBorrowed,
    lastTradePrices,
  };
};
