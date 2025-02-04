// import { ColumnProps } from "@/types/ColumnNames";
// import { getRowTypeValues, RowType } from "@/types/RowType";
// import type { TransactionRow } from "@/types/TransactionRow";
// import { TableUtils } from "@/utils/tableUtils";
// import { isUSD } from "@/utils/ticker";
// import {
//   validateRow,
//   type ValidationResult,
// } from "@/utils/tableUtil/validateRow";
// import type { Ref } from "vue";

// // actions that happen before or after editing a row

// interface UseEditPrePostOptions {
//   tableRows: Ref<TransactionRow[]>;
// }

// const updateUSDValue = (row: any, inSide: boolean) => {
//   if (inSide && isUSD(row.inCurrency)) {
//     row.usdValue = row.inAmount;
//   } else if (!inSide && isUSD(row.outCurrency)) {
//     row.usdValue = row.outAmount;
//   }
// };

// // ColumnProp validators
// const lastGoodDates: { [key: string]: string | null } = {};

// const validateDate = (row: TransactionRow, prop: keyof TransactionRow) => {
//   const model = { id: row.id }; // Assuming model.id is row.id
//   let fixedValue = null;
//   const value = row[prop as keyof TransactionRow]?.toString();
//   if (value) {
//     const regex = /(\d{4})[-/.\s](\d{2})[-/.\s](\d{2})/;
//     const match = value.match(regex);
//     if (match) {
//       // Reconstruct the date in "YYYY-MM-DD" format
//       const [_, year, month, day] = match;
//       fixedValue = `${year}-${month}-${day}`;
//       lastGoodDates[model.id] = fixedValue;
//       console.log("setting", model.id, fixedValue);
//     }
//   }

//   if (!fixedValue) {
//     const goodValue = lastGoodDates[model.id];
//     const msg = `bad date: ${value}`;
//     fixedValue = goodValue ? goodValue : msg;
//   }

//   (row[prop as keyof TransactionRow] as unknown as string) = fixedValue;
// };
// const shouldUpdateUSDValue = (row: TransactionRow, prop: string) => {
//   // auto-update USD value column
//   // called when user edits an amount in USDC, USD, etc.
//   if (row.isSubRow) return;

//   if (prop === ColumnProps.IN_AMOUNT || prop === ColumnProps.IN_CURRENCY) {
//     updateUSDValue(row, true);
//   } else if (
//     prop === ColumnProps.OUT_AMOUNT ||
//     prop === ColumnProps.OUT_CURRENCY
//   ) {
//     updateUSDValue(row, false);
//   }
// };
// const validateAmount = (row: TransactionRow, prop: keyof TransactionRow) => {
//   // const numericValue = parseFloat(stringNumber.replace(/,/g, ""));
//   const numericValue = parseFloat((row[prop] as string).replace(/,/g, ""));
//   if (isNaN(numericValue)) {
//     (row[prop as keyof TransactionRow] as null) = null;
//   } else {
//     (row[prop as keyof TransactionRow] as number) = numericValue;
//   }
//   shouldUpdateUSDValue(row, prop);
// };
// const validateFeeAmount = (row: TransactionRow, prop: keyof TransactionRow) => {
//   let val = (row[prop] as string).toLowerCase();
//   if (val === "") {
//     // do nothing
//   } else if (val === "auto" || "auto".includes(val)) {
//     // val can be a number or "auto"
//     (row[prop as keyof TransactionRow] as string) = "auto";
//   } else {
//     // val is float
//     const numericValue = parseFloat((row[prop] as string).replace(/,/g, ""));
//     if (isNaN(numericValue)) {
//       (row[prop as keyof TransactionRow] as null) = null;
//     } else {
//       (row[prop as keyof TransactionRow] as number) = numericValue;
//     }
//   }
// };

// const validateRowType = (row: TransactionRow, prop: keyof TransactionRow) => {
//   const rowIsSub = row.isSubRow;
//   const allowedRowTypes = getRowTypeValues(rowIsSub);
//   if (!allowedRowTypes.includes(row[prop] as string)) {
//     (row[prop as keyof TransactionRow] as string) = rowIsSub
//       ? RowType.subERROR
//       : RowType.ERROR;
//   }
// };

// const propValidators = {
//   [ColumnProps.DATE]: validateDate,
//   [ColumnProps.IN_AMOUNT]: validateAmount,
//   [ColumnProps.IN_CURRENCY]: shouldUpdateUSDValue,
//   [ColumnProps.OUT_AMOUNT]: validateAmount,
//   [ColumnProps.OUT_CURRENCY]: shouldUpdateUSDValue,
//   [ColumnProps.FEE_AMOUNT]: validateFeeAmount,
//   [ColumnProps.ROW_TYPE]: validateRowType,
// };

// export function useEditPrePost({ tableRows }: UseEditPrePostOptions) {

//   const validatePropChange = (
//     row: TransactionRow,
//     prop: string
//   ): ValidationResult => {
//     // console.log("changed", row, prop, "of", row);
//     const validator = propValidators[prop as keyof typeof propValidators];
//     if (validator) {
//       validator(row, prop as keyof TransactionRow);
//     }
//     return TableUtils.validateRow(row);
//   };
//   return {
//     appendNewRow,
//     validatePropChange,
//   };
// }
