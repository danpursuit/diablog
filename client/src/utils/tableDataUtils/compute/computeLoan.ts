import {
  _emptyRowCurCompute,
  createRowCurCompute,
  type CumCurCompute,
  type RowCurCompute,
} from "@/types/CurComputeTypes";
import { RowType } from "@/types/RowType";
import type { TransactionRow } from "@/types/TransactionRow";
import { handleLoss } from "./computeRewardLoss";

// loans:
// borrow, reBuy, repay, principle, interest

export const handleBorrow = (
  cur: string,
  row: TransactionRow,
  cumData: CumCurCompute
): RowCurCompute => {
  // a borrow counts
  // does not realize any PNL
  // the "USD Value" can be anything, but it's not used
  if (row.rowType !== RowType.BORROW)
    throw new Error(`rowType ${row.rowType} not BORROW`);
  if (row.inCurrency !== cur)
    throw new Error(`inCurrency ${row.inCurrency} not ${cur}`);

  const amount = row.inAmount || 0;
  cumData.handleBorrow(amount, row.network);
  return _emptyRowCurCompute(cumData, row);
};

// skip rebuy; it is same as buy

// repay = repay principle, but are interchangeable
export const handleRepay = (
  cur: string,
  row: TransactionRow,
  cumData: CumCurCompute
): RowCurCompute => {
  // a repay counts as a sell for $0
  if (row.rowType !== RowType.REPAY && row.rowType !== RowType.subPRINCIPLE)
    throw new Error(`rowType ${row.rowType} not REPAY`);

  if (row.outAmount && row.outCurrency === cur) {
    cumData.handleRepay(row.outAmount, row.network);
  }
  return _emptyRowCurCompute(cumData, row);
};

// repay principle; forward to handle repay
export const handlePrinciple = (
  cur: string,
  row: TransactionRow,
  cumData: CumCurCompute
): RowCurCompute => {
  return handleRepay(cur, row, cumData);
};

// repay interest; forward to handle loss
export const handleInterest = (
  cur: string,
  row: TransactionRow,
  cumData: CumCurCompute
): RowCurCompute => {
  return handleLoss(cur, row, cumData);
};
