import type {
  VNode,
  CellProps,
  ColumnDataSchemaModel,
  HyperFunc,
} from "@revolist/revogrid";
import BasicDateType from "@revolist/revogrid-column-date";

// note: this class was created for date validation but the validation is now deprecated,
// - because the validation here was a display-only validation, and did not affect the actual list
// now, this class inherits from revogrid-column-date (view their package for code)

const svg = `<svg aria-hidden="true" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fill-rule="evenodd" transform="translate(2 2)">
        <path d="m2.5.5h12c1.1045695 0 2 .8954305 2 2v12c0 1.1045695-.8954305 2-2 2h-12c-1.1045695 0-2-.8954305-2-2v-12c0-1.1045695.8954305-2 2-2z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="m.5 4.5h16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path>
        <g fill="currentColor">
            <circle cx="8.5" cy="8.5" r="1"></circle>
            <circle cx="4.5" cy="8.5" r="1"></circle>
            <circle cx="12.5" cy="8.5" r="1"></circle>
            <circle cx="8.5" cy="12.5" r="1"></circle>
            <circle cx="4.5" cy="12.5" r="1"></circle>
            <circle cx="12.5" cy="12.5" r="1"></circle>
        </g>
    </g>
</svg>
`;
export class DateColumnType extends BasicDateType {
  lastGoodValues: Map<string, string>;

  constructor() {
    super();
    this.lastGoodValues = new Map();
  }

  cellTemplate = (
    h: HyperFunc<VNode>,
    { model, value }: ColumnDataSchemaModel
  ): VNode[] => {
    const fixedValue = value;

    // save old logic here, with a manual regex search
    // let fixedValue = null;
    // value = value.toString();
    // const regex = /(\d{4})[-/.\s](\d{2})[-/.\s](\d{2})/;
    // const match = value.match(regex);
    // if (match) {
    //   // Reconstruct the date in "YYYY-MM-DD" format
    //   const [_, year, month, day] = match;
    //   fixedValue = `${year}-${month}-${day}`;
    //   this.lastGoodValues.set(model.id, fixedValue);
    //   console.log("setting", model.id, fixedValue);
    //   // this.lastGoodValue = fixedValue;
    // }
    // if (!fixedValue) {
    //   const goodValue = this.lastGoodValues.get(model.id);
    //   console.log("goodValue", goodValue);
    //   const msg = `bad date: ${value}`;
    //   console.log("msg", msg);
    //   fixedValue = goodValue ? goodValue : `bad date: ${value}`;
    // }

    return [
      h("div", { class: { "cell-value-wrapper": true } }, fixedValue),
      h("button", {
        class: { calendar: true },
        innerHTML: svg,
        onClick: (e: any) => {
          const ev = new MouseEvent("dblclick", {
            bubbles: true,
            cancelable: true,
            view: window,
          });
          e.target.dispatchEvent(ev);
        },
      }),
    ];
  };
}
