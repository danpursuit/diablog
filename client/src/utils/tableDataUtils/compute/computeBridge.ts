import {
  createRowCurCompute,
  type CumCurCompute,
  type RowCurCompute,
} from "@/types/CurComputeTypes";
import { RowType } from "@/types/RowType";
import type { TransactionRow } from "@/types/TransactionRow";

// bridge transactions should change the amount on the network
// but not affect pnl

export const handleBridgeIn = (
  cur: string,
  row: TransactionRow,
  cumData: CumCurCompute
): RowCurCompute => {
  if (row.rowType !== RowType.BRIDGEIN)
    throw new Error(`rowType ${row.rowType} not BRIDGEIN`);
  if (row.inCurrency !== cur)
    throw new Error(`inCurrency ${row.inCurrency} not ${cur}`);

  const amount = row.inAmount || 0;
  cumData.handleBridge(amount, row.network);
  // cumData.addToNetwork(row.network, amount);
  return createRowCurCompute(
    { price: (row.usdValue || 0) / amount, pnl: 0 },
    cumData,
    row
  );
};

export const handleBridgeOut = (
  cur: string,
  row: TransactionRow,
  cumData: CumCurCompute
): RowCurCompute => {
  if (row.rowType !== RowType.BRIDGEOUT)
    throw new Error(`rowType ${row.rowType} not BRIDGEOUT`);
  if (row.outCurrency !== cur)
    throw new Error(`outCurrency ${row.outCurrency} not ${cur}`);

  const amount = row.outAmount || 0;
  if (amount < 0) throw new Error("handleBridgeOut: amount must be positive");
  cumData.handleBridge(-amount, row.network);
  return createRowCurCompute(
    { price: (row.usdValue || 0) / amount, pnl: 0 },
    cumData,
    row
  );
  // return {
  //   price: (row.usdValue || 0) / amount,
  //   avgPrice: cumData.avgPrice,
  //   pnl: 0,
  //   cumPnl: cumData.cumPnl(),
  //   cumAmount: cumData.cumAmount,
  //   amountInNetwork: cumData.amountInNetwork(row.network),
  // };
};

// export const handleInitiate = (
//   cur: string,
//   row: TransactionRow,
//   cumData: CumCurCompute
// ): RowCurCompute => {
//   if (row.rowType !== RowType.INIT)
//     throw new Error(`rowType ${row.rowType} not INIT`);
//   if (row.inCurrency !== cur)
//     throw new Error(`inCurrency ${row.inCurrency} not ${cur}`);

//   const amount = row.inAmount || 0;
//   cumData.handleBridge(amount, row.network);
//   // cumData.addToNetwork(row.network, amount);
//   return createRowCurCompute(
//     { price: (row.usdValue || 0) / amount, pnl: 0 },
//     cumData,
//     row
//   );
// };
