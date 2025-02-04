import { RowType } from "@/types/RowType";
import type { TableData } from "@/types/TableData";
import { newSubRow } from "@/utils/tableDataUtils/newRows";

interface UseSubRowsOptions {
  tableData: TableData;
}

export function useSubRows({ tableData }: UseSubRowsOptions) {
  const addSubRow = (parentId: string): void => {
    // addSubRow should add to rowsDisplayed
    const parentRow = tableData.rowsDisplayed.find(
      (row) => row.id === parentId
    );
    if (!parentRow || parentRow.isSubRow) {
      return;
    }
    if (parentRow.rowType === RowType.TRADE) {
      // a trade can't have sub rows
      alert("Trades can't have sub rows");
      return;
    }
    let initialRowType: RowType;
    if (parentRow.rowType === RowType.REPAY) {
      initialRowType = RowType.subPRINCIPLE;
    } else if (parentRow.rowType === RowType.BORROW) {
      initialRowType = RowType.subREBUY;
    } else {
      alert(`Can't add sub row to ${parentRow.rowType}`);
      return;
    }
    // create the sub row
    const subRow = newSubRow(parentRow, initialRowType);

    // Find the last sub-row for this parent, or the parent itself
    let insertIndex = tableData.rowsDisplayed.findIndex(
      (row) => row.id === parentId
    );
    for (let i = tableData.rowsDisplayed.length - 1; i >= 0; i--) {
      if (tableData.rowsDisplayed[i].parentId === parentId) {
        insertIndex = i;
        break;
      }
    }

    // Insert into tableRows
    console.log("adding subrow", subRow);
    tableData.rowsDisplayed.splice(insertIndex + 1, 0, subRow);
    // trigger re-render
    tableData.rowsDisplayed = [...tableData.rowsDisplayed];
  };

  return {
    addSubRow,
  };
}
