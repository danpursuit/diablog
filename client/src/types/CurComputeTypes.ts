// [CumCurData - per coin
// - total USD spent
// - total amount bought
// - total amount sold

import { Currency } from "@/utils/currencies";
import type { TransactionRow } from "./TransactionRow";

// need to change the formula
// currently cumPNL is based on "avgSellPrice - avgBuyPrice" * amountSold
// in this equation, avgSellPrice = $sold / #sold, this is correct
// but, avgBuyPrice should not account for buys AFTER the sells
// current formula: avgBuyPrice = $spent / #bought
// $spent, #bought should dynamically update as follows:
// on sell, #bought -= amountSold
// $spent *= #newBought / #oldBought

// - total USD sold]
export interface CumCurComputeType {
  cur: string;
  vSpent: number; // value spent ($) ONLY used for avgPrice
  aBought: number; // amount bought; ONLY used for avgPrice
  netBridged: number; // amount bridged in - amount bridged out // becomes > 0 when we inject money in, without affecting pnl
  // owned by chain, str -> number
  ownedByNetwork: { [key: string]: number };
  // loans by chain, str -> number
  loansByNetwork: { [key: string]: number };

  // below are amounts relevant to pnl calc
  aSold: number; // amount sold
  vSold: number; // value sold ($)
  // extraPnl: number; // extra pnl DEPRECATED
  realizedPnl: number;
  interestValue: number; // positive, deducted against pnl
  lostValue: number; // positive, deducted against pnl
  rollingSpent: number; // new compute to replace vSpent
  rollingBought: number; // new compute to replace aBought
  lastPrice: number;
}

/*
Note that Stables have special rules applied to them because of this special handling:
- When we receive/lose a stable, it counts towards PNL immediately.
- normally, a loss counts towards PNL (sell for 0), but a gain does not (buy for 0)
As a result, as long as we can assume a Stable's value = 1, we handle pnl differently:
- avgPrice always 1
- cumulativePNL ignores all buy/sells
- cumulativePNL = "extraPNL" which comes from direct receive/loss
*/

export class CumCurCompute implements CumCurComputeType {
  cur: string;
  vSpent: number; // value spent ($)
  aBought: number; // amount bought
  aSold: number; // amount sold
  vSold: number; // value sold ($)
  netBridged: number; // amount bridged in - amount bridged out
  ownedByNetwork: { [key: string]: number };
  loansByNetwork: { [key: string]: number };
  // extraPnl: number; // extra pnl

  realizedPnl: number;
  interestValue: number; // positive, deducted against pnl
  lostValue: number; // positive, deducted against pnl
  rollingSpent: number; // new compute to replace vSpent
  rollingBought: number; // new compute to replace aBought
  lastPrice: number;

  isStable: boolean;

  constructor(
    cur: string,
    vSpent = 0,
    aBought = 0,
    aSold = 0,
    vSold = 0,
    // extraPnl = 0,
    realizedPnl = 0,
    rollingSpent = 0,
    rollingBought = 0
  ) {
    this.cur = cur;
    this.vSpent = vSpent;
    this.aBought = aBought;
    this.ownedByNetwork = {};
    this.loansByNetwork = {};
    this.aSold = aSold;
    this.vSold = vSold;
    this.netBridged = 0;
    // this.extraPnl = extraPnl;

    this.realizedPnl = realizedPnl;
    this.interestValue = 0; // positive, deducted against pnl
    this.lostValue = 0; // positive, deducted against pnl
    this.rollingSpent = rollingSpent;
    this.rollingBought = rollingBought;

    this.isStable = Currency.stable.includes(cur);

    this.lastPrice = this.isStable ? this.avgPrice : 0;
  }

  // Get the average price
  get avgPrice(): number {
    if (this.isStable) return 1;
    return this.aBought === 0 ? 0 : this.vSpent / this.aBought;
  }

  // Get the cumulative amount
  get cumAmount(): number {
    return this.aBought - this.aSold + this.totalBorrowed + this.netBridged;
  }
  get netAmount(): number {
    // this is your total exposure to coin $ change
    return this.aBought - this.aSold + this.netBridged;
  }

  get totalBorrowed(): number {
    return Object.values(this.loansByNetwork).reduce((a, b) => a + b, 0);
  }

  addLastPrice(amount: number, value: number): void {
    this.lastPrice = value / amount;
  }
  addToNetwork(network: string, amount: number): void {
    if (this.ownedByNetwork[network]) {
      this.ownedByNetwork[network] += amount;
    } else {
      this.ownedByNetwork[network] = amount;
    }
    console.log(`addToNetwork ${network} ${amount}`);
    if (this.cur === "SHOGGOTH") {
      console.log(`addToNetwork ${network} ${amount}`);
    }
  }
  amountInNetwork(network: string): number {
    return (
      (this.ownedByNetwork[network] || 0) + (this.loansByNetwork[network] || 0)
    );
  }

  // Get the cumulative PnL
  cumPnl(includeExtra: boolean = true): number {
    // if (this.isStable) return this.extraPnl;
    // return this.extraPnl + this.realizedPnl;
    return this.realizedPnl - this.interestValue - this.lostValue;

    // if (this.aBought === 0 || this.aSold === 0) return 0;
    // const buyPrice = this.vSpent / this.aBought;
    // const sellPrice = this.vSold / this.aSold;
    // const tradingPnl = (sellPrice - buyPrice) * this.aSold;
    // return tradingPnl + (includeExtra ? this.extraPnl : 0);
  }

  handleBridge(amount: number, network: string): void {
    // amount > 0: bridge in; amount < 0: bridge out
    this.netBridged += amount;
    this.addToNetwork(network, amount);
  }

  handleBuy(amount: number, value: number, network: string): void {
    this.addToNetwork(network, amount);
    // skip stables
    if (this.isStable) {
      this.aBought += amount;
      return;
    }
    this.addLastPrice(amount, value);
    // make sure amount is positive
    if (amount < 0) throw new Error("handleBuy: amount must be positive");
    this.aBought += amount;
    this.vSpent += value;
    this.rollingBought += amount;
    this.rollingSpent += value;
  }

  handleSell(amount: number, value: number, network: string): number {
    this.addToNetwork(network, -amount);
    // make sure amount is positive
    if (amount < 0) throw new Error("handleSell: amount must be positive");
    // skip stables
    if (this.isStable) {
      this.aSold += amount;
      return 0;
    }
    this.addLastPrice(amount, value);
    this.aSold += amount;
    this.vSold += value;
    // realize PNL
    const buyPrice = this.rollingSpent / this.rollingBought;
    const sellPrice = value / amount;
    const pnl = (sellPrice - buyPrice) * amount;
    this.realizedPnl += pnl;

    // update rolling values
    this.rollingBought -= amount;
    this.rollingSpent *= this.rollingBought / (this.rollingBought + amount);

    // return pnl
    return pnl;
  }

  // handle extra amount; return pnl of this
  handleExtra(amount: number, network: string): number {
    if (amount > 0) {
      this.addToNetwork(network, amount);
      // stable gains contribute to extraPnl
      if (this.isStable) {
        this.aBought += amount;
        this.realizedPnl += amount * this.avgPrice;
        return amount * this.avgPrice;
      }
      this.handleBuy(amount, 0, network);
      return 0;
    }
    if (amount < 0) {
      this.addToNetwork(network, -amount);
      // all losses contribute to extraPnl
      if (this.isStable) {
        this.aSold -= amount;
        this.realizedPnl += amount * this.avgPrice; // should be negative
        return amount * this.avgPrice;
      } else {
        return this.handleSell(-amount, 0, network);
      }
    }
    return 0;
  }

  // handle borrow; increase loans in loansByNetwork
  handleBorrow(amount: number, network: string): void {
    if (amount < 0) throw new Error("handleBorrow: amount must be positive");
    if (this.loansByNetwork[network]) {
      this.loansByNetwork[network] += amount;
    } else {
      this.loansByNetwork[network] = amount;
    }
  }
  // handle repay; decrease loans in loansByNetwork
  handleRepay(amount: number, network: string): void {
    if (amount < 0) throw new Error("handleRepay: amount must be positive");
    if (this.loansByNetwork[network]) {
      this.loansByNetwork[network] -= amount;
    } else {
      console.log("WARNING handleRepay: no loan to repay");
      this.loansByNetwork[network] = -amount; // may happen by filters or mismatched data
    }
  }
}

// [RowCurData]
// - price
// - avg price
// - pnl
// - cum pnl
// - cum amount owned
export interface RowCurCompute {
  price: number;
  avgPrice: number;
  pnl: number;
  cumPnl: number;
  cumAmount: number;
  netAmount: number;
  amountInNetwork: number;
  amountBorrowed: number;
}

// RowComputeData, the compute data for a row
// - list of curs (should be 2)
// - dict of cur : RowCurCompute (one for each in list)
export interface RowCompute {
  curs: string[];
  curData: { [key: string]: RowCurCompute };
}

export const _emptyRowCurCompute = (
  cumData: CumCurCompute,
  row: TransactionRow
): RowCurCompute => {
  return {
    price: 0,
    avgPrice: cumData.avgPrice,
    pnl: 0,
    cumPnl: cumData.cumPnl(),
    cumAmount: cumData.cumAmount,
    netAmount: cumData.netAmount,
    amountInNetwork: cumData.amountInNetwork(row.network),
    amountBorrowed: cumData.totalBorrowed,
  };
};

export const createRowCurCompute = (
  { price, pnl }: { price: number; pnl: number },
  cumData: CumCurCompute,
  row: TransactionRow
): RowCurCompute => {
  return {
    ..._emptyRowCurCompute(cumData, row),
    price,
    pnl,
  };
};
