import type {
  VNode,
  CellProps,
  ColumnDataSchemaModel,
  HyperFunc,
} from "@revolist/revogrid";
import { AmountColumnType } from "./AmountColumnType";

export class FeeAmountColumnType extends AmountColumnType {
  constructor(format?: string) {
    super(format);
  }

  // Override the cellTemplate to handle both "auto" and number values
  cellTemplate = (_h: HyperFunc<VNode>, p: ColumnDataSchemaModel): string => {
    const val = p.model[p.prop];
    if (val === null || val === "") return ""; // null values allowed

    // Handle "auto" value specifically
    if (val === "auto" || "auto".includes(val)) {
      return "auto";
    }

    // Use parent class formatting for numbers
    return this.formated(val);
  };
}
