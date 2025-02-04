// USD -> USDC -> USDT -> BTC -> ETH -> SOL -> any alt
// if both are alts, the smaller amount goes first (i.e. BNB smaller amount than PEPE)

// this sort is used to determine which coin goes first in a transaction pair
import { Currency } from "../../currencies";

const stables = Currency.stable;
const mains = ["BTC", "ETH", "SOL"];

const preferred = [...stables, ...mains];

export const sortCurrency = (
  a: string,
  b: string,
  aAmount?: number | null,
  bAmount?: number | null
): number => {
  const aIndex = preferred.indexOf(a);
  const bIndex = preferred.indexOf(b);

  if (aIndex === -1 && bIndex === -1) {
    if (typeof aAmount === "number" && typeof bAmount === "number") {
      return aAmount - bAmount;
    }
    return a.localeCompare(b);
  }
  if (aIndex === -1) return 1;

  if (bIndex === -1) return -1;

  if (aIndex < bIndex) return -1;

  if (aIndex > bIndex) return 1;

  if (typeof aAmount === "number" && typeof bAmount === "number")
    return aAmount - bAmount;

  return 0;
};
