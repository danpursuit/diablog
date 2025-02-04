// Define a list of currencies
export const usdCurs: string[] = ["USD", "USDC", "USDT"];

export function isUSD(currency: string): boolean {
  return usdCurs.includes(currency);
}
