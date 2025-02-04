import type {
  VNode,
  CellProps,
  ColumnDataSchemaModel,
  HyperFunc,
} from "@revolist/revogrid";
import NumberColumnType from "@revolist/revogrid-column-numeral";

// this is for basic float; currently no extra config
// this does get extended by FeeAmountColumnType though
export class AmountColumnType extends NumberColumnType {
  constructor(format?: string) {
    super(format);
  }

  // Override the cellTemplate to handle both "auto" and number values
  cellTemplate = (_h: HyperFunc<VNode>, p: ColumnDataSchemaModel): string => {
    const val = p.model[p.prop];
    if (val === null) return ""; // null values allowed

    // Use parent class formatting for numbers
    return this.formated(val);
  };
}
