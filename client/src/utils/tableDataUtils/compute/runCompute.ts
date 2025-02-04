import {
  _emptyRowCurCompute,
  createRowCurCompute,
  CumCurCompute,
  type RowCompute,
  type RowCurCompute,
} from "@/types/CurComputeTypes";
import type { TransactionRow } from "@/types/TransactionRow";
import { sortCurrency } from "./sortCurrency.ts";
import { RowType } from "@/types/RowType.ts";
import { handleBridgeIn, handleBridgeOut } from "./computeBridge.ts";
import { handleLoss, handleReward } from "./computeRewardLoss.ts";
import { handleBorrow, handleInterest, handleRepay } from "./computeLoan.ts";

// refactoring to track amount owned by network
// however, PNL calculation should not change
const _handleSameCurRow = (
  cur: string,
  row: TransactionRow,
  cumData: CumCurCompute
): RowCurCompute => {
  // this is a special case if in/out cur are the same
  // treat as a direct gain/loss
  if (cur !== row.inCurrency || cur !== row.outCurrency)
    throw new Error(`cur ${cur} not in row ${row}`);
  const amount = (row.inAmount || 0) - (row.outAmount || 0);
  const pnl = cumData.handleExtra(amount, row.network);
  return createRowCurCompute({ price: cumData.avgPrice, pnl }, cumData, row);
};
const calculateRowCurCompute = (
  cur: string,
  row: TransactionRow,
  cumData: CumCurCompute
): RowCurCompute => {
  // note that direct gain/loss doesn't use usdValue! Do not reorder these initial checks
  if (row.inCurrency === row.outCurrency)
    return _handleSameCurRow(cur, row, cumData); // handle as direct gain/loss
  if (row.rowType === RowType.BRIDGEIN)
    return handleBridgeIn(cur, row, cumData);
  if (row.rowType === RowType.BRIDGEOUT)
    return handleBridgeOut(cur, row, cumData);
  if (row.rowType === RowType.REWARD) return handleReward(cur, row, cumData);
  if (row.rowType === RowType.LOSS) return handleLoss(cur, row, cumData); // same as reward
  if (row.rowType === RowType.BORROW) return handleBorrow(cur, row, cumData); // same as reward
  if (row.rowType === RowType.REPAY) return handleRepay(cur, row, cumData); // same as reward
  if (row.rowType === RowType.subPRINCIPLE)
    return handleRepay(cur, row, cumData); // same as reward
  if (row.rowType === RowType.subINTEREST)
    return handleInterest(cur, row, cumData); // same as reward

  if (row.rowType !== RowType.TRADE && row.rowType !== RowType.subREBUY)
    throw new Error(`rowType ${row.rowType} not TRADE`);
  if (!row.usdValue) return _emptyRowCurCompute(cumData, row); // effective skip

  let amount = 0;
  let value = 0;
  let pnl = 0;
  if (row.inCurrency === cur) {
    amount = row.inAmount || 0;
    value = row.usdValue || 0;
    cumData.handleBuy(amount, value, row.network);
    // amount += row.inAmount || 0;
    // cumData.aBought += row.inAmount || 0;
    // cumData.vSpent += row.usdValue;
  } else if (row.outCurrency === cur) {
    amount = row.outAmount || 0;
    value = row.usdValue || 0;
    pnl = cumData.handleSell(amount, value, row.network);
    // amount -= row.outAmount || 0;
    // cumData.aSold += row.outAmount || 0;
    // cumData.vSold += row.usdValue;
  }
  if (amount === 0) return _emptyRowCurCompute(cumData, row); // effective skip
  const price = Math.abs(row.usdValue / amount); // value bought or sold, depending on this tx
  return createRowCurCompute({ price, pnl }, cumData, row);
};
const createRowCompute = (): RowCompute => {
  return {
    curs: [],
    curData: {},
  };
};

const getCurrencies = (row: TransactionRow): string[] => {
  if (row.inCurrency && row.outCurrency && row.inCurrency !== row.outCurrency) {
    //  use sortCurrency to sort the currencies
    const sortOrder = sortCurrency(
      row.inCurrency,
      row.outCurrency,
      row.inAmount,
      row.outAmount
    );
    // the order is reversed
    return sortOrder === 1
      ? [row.inCurrency, row.outCurrency]
      : [row.outCurrency, row.inCurrency];
  }
  if (row.inCurrency) return [row.inCurrency];
  if (row.outCurrency) return [row.outCurrency];
  return [];
};

// run 0-2 currency computes for the tx
const computeRow = (
  row: TransactionRow,
  allCumData: { [key: string]: CumCurCompute }
): void => {
  // console.log("computeRow", row.rowType);
  const compute = createRowCompute();
  compute.curs = getCurrencies(row);
  compute.curs.forEach((cur) => {
    if (!allCumData[cur]) allCumData[cur] = new CumCurCompute(cur);
    const curCompute = calculateRowCurCompute(cur, row, allCumData[cur]);
    compute.curData[cur] = curCompute;
    // console.log("curCompute", curCompute);
  });
  row.compute = compute;
};

// todo: HERE
// skpping rebuy row rn beecause no USD value, fix this (add usd value?)

// assign RowComputeData to each row
// in future, have an option to only run certain currencies
export const runTableCompute = (rows: TransactionRow[]): void => {
  // note, rows must be sorted before getting here
  // initialize curData
  const allCumData: { [key: string]: CumCurCompute } = {};
  for (const row of rows) {
    // const isUnrelatedSubRow = row.isSubRow && row.rowType !== RowType.subREBUY;
    const isErrorRow =
      row.rowType === RowType.ERROR || row.rowType === RowType.subERROR;
    // if (isErrorRow || !row.finalized || !row.usdValue) {
    if (isErrorRow || !row.finalized) {
      console.log("skipping row", row.rowType);
      continue;
    }
    computeRow(row, allCumData);
  }

  return;
};
