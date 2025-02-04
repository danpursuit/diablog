// import { isSubRow, RowType } from "@/types/RowType";
// import type { TransactionRow } from "@/types/TransactionRow";

// // part of tableEvents/finalizeRow, but the logic is long
// // store separately here
// // returns a reason + boolean
// export interface ValidationResult {
//   valid: boolean;
//   reason: string;
// }

// const _checkFieldsEmpty = (
//   row: TransactionRow,
//   notAllowedFields: string[]
// ): ValidationResult => {
//   for (const field of notAllowedFields) {
//     if (row[field as keyof TransactionRow]) {
//       return {
//         valid: false,
//         reason: `${field} is not allowed in ${row.rowType}`,
//       };
//     }
//   }
//   return { valid: true, reason: "" };
// };

// // todo: put this into the "Finalize" part of the code
// export const validateRow = (
//   row: TransactionRow,
//   attemptingFinalize: boolean = false
// ): ValidationResult => {
//   if (!row.finalized && !attemptingFinalize) {
//     // if the row is not finalized, no need to validate
//     return { valid: true, reason: "" };
//   }

//   // validations:

//   // generic:
//   // date is required
//   if (!row.date) {
//     return { valid: false, reason: "date is required" };
//   }

//   if (!isSubRow(row.rowType)) {
//     // for non-sub rows:
//     // feeCurrency is required
//     if (!row.feeCurrency) {
//       return { valid: false, reason: "feeCurrency is required" };
//     }
//     // feeAmount is required
//     if (row.feeAmount === null) {
//       return { valid: false, reason: "feeAmount is required" };
//     }

//     // usdValue is required
//     if (row.usdValue === null) {
//       return { valid: false, reason: "usdValue is required" };
//     }
//   }

//   // trade:
//   // inAmount is required
//   // inCurrency is required
//   // outAmount is required
//   // outCurrency is required
//   if (row.rowType === RowType.TRADE || row.rowType === RowType.subREBUY) {
//     if (!row.inAmount) {
//       return { valid: false, reason: "inAmount is required" };
//     }
//     if (!row.inCurrency) {
//       return { valid: false, reason: "inCurrency is required" };
//     }
//     if (!row.outAmount) {
//       return { valid: false, reason: "outAmount is required" };
//     }
//     if (!row.outCurrency) {
//       return { valid: false, reason: "outCurrency is required" };
//     }
//     // extra validations for subRebuy that were skpped
//     // usdValue is required
//     if (row.rowType === RowType.subREBUY && row.usdValue === null) {
//       return { valid: false, reason: "usdValue is required" };
//     }
//   }

//   // bridgeIn:
//   // inAmount is required
//   // inCurrency is required
//   // out fields are not allowed
//   if (row.rowType === RowType.BRIDGEIN) {
//     if (!row.inAmount) {
//       return { valid: false, reason: "inAmount is required" };
//     }
//     if (!row.inCurrency) {
//       return { valid: false, reason: "inCurrency is required" };
//     }
//     const notAllowedFields = [
//       "outAmount",
//       "outCurrency",
//     ] as (keyof TransactionRow)[];
//     for (const field of notAllowedFields) {
//       if (row[field]) {
//         return {
//           valid: false,
//           reason: `${field} is not allowed in ${row.rowType}`,
//         };
//       }
//     }
//   }

//   // bridgeOut:
//   // outAmount is required
//   // outCurrency is required
//   // in fields are not allowed
//   if (row.rowType === RowType.BRIDGEOUT) {
//     if (!row.outAmount) {
//       return { valid: false, reason: "outAmount is required" };
//     }
//     if (!row.outCurrency) {
//       return { valid: false, reason: "outCurrency is required" };
//     }
//     const notAllowedFields = [
//       "inAmount",
//       "inCurrency",
//     ] as (keyof TransactionRow)[];
//     for (const field of notAllowedFields) {
//       if (row[field]) {
//         return {
//           valid: false,
//           reason: `${field} is not allowed in ${row.rowType}`,
//         };
//       }
//     }
//   }

//   // reward:
//   // inAmount is required
//   // inCurrency is required
//   // out fields are not allowed
//   if (row.rowType === RowType.REWARD) {
//     if (!row.inAmount) {
//       return { valid: false, reason: "inAmount is required" };
//     }
//     if (!row.inCurrency) {
//       return { valid: false, reason: "inCurrency is required" };
//     }
//     const result = _checkFieldsEmpty(row, ["outAmount", "outCurrency"]);
//     if (!result.valid) return result;
//   }

//   // loss:
//   // outAmount is required
//   // outCurrency is required
//   // in fields are not allowed
//   if (row.rowType === RowType.LOSS) {
//     if (!row.outAmount) {
//       return { valid: false, reason: "outAmount is required" };
//     }
//     if (!row.outCurrency) {
//       return { valid: false, reason: "outCurrency is required" };
//     }
//     const result = _checkFieldsEmpty(row, ["inAmount", "inCurrency"]);
//     if (!result.valid) return result;
//   }

//   // borrow:
//   // inAmount is required
//   // inCurrency is required
//   // out fields are not allowed
//   if (row.rowType === RowType.BORROW) {
//     if (!row.inAmount) {
//       return { valid: false, reason: "inAmount is required" };
//     }
//     if (!row.inCurrency) {
//       return { valid: false, reason: "inCurrency is required" };
//     }
//     const result = _checkFieldsEmpty(row, ["outAmount", "outCurrency"]);
//     if (!result.valid) return result;
//   }

//   // repay (same as subprinciple)
//   // outAmount is required
//   // outCurrency is required
//   // in fields are not allowed
//   if (row.rowType === RowType.REPAY || row.rowType === RowType.subPRINCIPLE) {
//     if (!row.outAmount) {
//       return { valid: false, reason: "outAmount is required" };
//     }
//     if (!row.outCurrency) {
//       return { valid: false, reason: "outCurrency is required" };
//     }
//     const result = _checkFieldsEmpty(row, ["inAmount", "inCurrency"]);
//     if (!result.valid) return result;
//   }

//   // interest
//   // outAmount is required
//   // outCurrency is required
//   // in fields are not allowed
//   // usdValue is required
//   if (row.rowType === RowType.subINTEREST) {
//     if (!row.outAmount) {
//       return { valid: false, reason: "outAmount is required" };
//     }
//     if (!row.outCurrency) {
//       return { valid: false, reason: "outCurrency is required" };
//     }
//     if (row.usdValue === null) {
//       return { valid: false, reason: "usdValue is required (interest payment deducted from pnl)" };
//     }
//     const result = _checkFieldsEmpty(row, ["inAmount", "inCurrency"]);
//     if (!result.valid) return result;
//   }

//   // subEXTRA out and in are disabled for now
//   // // for subEXTRAOUT
//   // // outAmount is required
//   // // outCurrency is required
//   // // other fields are not allowed
//   // if (row.rowType === RowType.subEXTRAOUT) {
//   //   if (row.outAmount === null) {
//   //     return { valid: false, reason: "outAmount is required" };
//   //   }
//   //   if (!row.outCurrency) {
//   //     return { valid: false, reason: "outCurrency is required" };
//   //   }
//   //   const notAllowedFields = [
//   //     "inAmount",
//   //     "inCurrency",
//   //     "feeAmount",
//   //     "feeCurrency",
//   //     "usdValue",
//   //   ] as (keyof TransactionRow)[];
//   //   for (const field of notAllowedFields) {
//   //     if (row[field]) {
//   //       return {
//   //         valid: false,
//   //         reason: `${field} is not allowed in ${row.rowType}`,
//   //       };
//   //     }
//   //   }
//   // }

//   // // for subEXTRAIN
//   // // inAmount is required
//   // // inCurrency is required
//   // // other fields are not allowed
//   // if (row.rowType === RowType.subEXTRAIN) {
//   //   if (row.inAmount === null) {
//   //     return { valid: false, reason: "inAmount is required" };
//   //   }
//   //   if (!row.inCurrency) {
//   //     return { valid: false, reason: "inCurrency is required" };
//   //   }
//   //   const notAllowedFields = [
//   //     "outAmount",
//   //     "outCurrency",
//   //     "feeAmount",
//   //     "feeCurrency",
//   //     "usdValue",
//   //   ] as (keyof TransactionRow)[];
//   //   for (const field of notAllowedFields) {
//   //     if (row[field]) {
//   //       return {
//   //         valid: false,
//   //         reason: `${field} is not allowed in ${row.rowType}`,
//   //       };
//   //     }
//   //   }
//   // }

//   return { valid: true, reason: "" };
// };
