import {
  _emptyRowCurCompute,
  createRowCurCompute,
  type CumCurCompute,
  type RowCurCompute,
} from "@/types/CurComputeTypes";
import { RowType } from "@/types/RowType";
import type { TransactionRow } from "@/types/TransactionRow";

// reward tx are like bridge, but losses affect pnl

export const handleReward = (
  cur: string,
  row: TransactionRow,
  cumData: CumCurCompute
): RowCurCompute => {
  // a reward counts as a buy for $0
  // does not realize any PNL
  // the "USD Value" can be anything, but it's not used
  if (row.rowType !== RowType.REWARD)
    throw new Error(`rowType ${row.rowType} not REWARD`);
  if (row.inCurrency !== cur)
    throw new Error(`inCurrency ${row.inCurrency} not ${cur}`);

  const amount = row.inAmount || 0;
  cumData.handleBuy(amount, 0, row.network);
  return _emptyRowCurCompute(cumData, row);
};

export const handleLoss = (
  cur: string,
  row: TransactionRow,
  cumData: CumCurCompute
): RowCurCompute => {
  // a loss counts as a sell for $0
  // interest is included here
  if (row.rowType !== RowType.LOSS && row.rowType !== RowType.subINTEREST)
    throw new Error(`rowType ${row.rowType} not LOSS`);
  if (row.outCurrency !== cur)
    throw new Error(`outCurrency ${row.outCurrency} not ${cur}`);
  // losses don't need USD value because you lost what you put in (avg buy price)
  // another example, if you get an airdrop (avg price $0), then if you lose it, you lost $0 pnl
  // if (!row.usdValue) throw new Error(`usdValue missing in ${row}`);

  const amount = row.outAmount || 0;
  // const pnl = cumData.handleSell(amount, row.usdValue, row.network);
  const pnl = cumData.handleSell(amount, 0, row.network);
  return createRowCurCompute(
    { price: (row.usdValue || 0) / amount, pnl },
    cumData,
    row
  );
};
