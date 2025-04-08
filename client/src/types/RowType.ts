// Define the enum
export enum RowType {
  TRADE = "Trade",
  BRIDGEIN = "Bridge In",
  BRIDGEOUT = "Bridge Out",
  // INIT = "Initiate",
  REWARD = "Reward",
  LOSS = "Loss",
  subEXTRAOUT = "↪extraOut",
  subEXTRAIN = "↪extraIn",
  BORROW = "Borrow",
  subREBUY = "↪ReBuy",
  REPAY = "Repay",
  subPRINCIPLE = "↪Principle",
  subINTEREST = "↪Interest",
  ERROR = "ERROR",
  subERROR = "↪ERROR",
}

export const isSubRow = (rowType: RowType): boolean => {
  return rowType.startsWith("↪");
};

// Helper function to get all values as an array
export const getRowTypeValues = (rowIsSub: boolean): string[] => {
  if (rowIsSub) {
    return Object.values(RowType).filter(
      (rowType) => isSubRow(rowType) && rowType !== RowType.subERROR
    );
  } else {
    return Object.values(RowType).filter(
      (rowType) => !isSubRow(rowType) && rowType !== RowType.ERROR
    );
  }
};

// Type guard to check if a string is a valid RowType
export const isValidRowType = (value: string): value is RowType => {
  return Object.values(RowType).includes(value as RowType);
};

// Optional: Define an interface for your data row
export interface DataRow {
  date: string;
  rowType: RowType;
  inAmount: number;
  inCurrency: string;
  outAmount: number;
  outCurrency: string;
}
