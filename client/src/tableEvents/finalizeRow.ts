import { API, Operation } from "@/api/api";
import { NotificationType } from "@/components/notifications/useNotifications";
import type { TableData } from "@/types/TableData";
import type { TransactionRow } from "@/types/TransactionRow";
import { assignRowClass } from "@/utils/rowStyling";
import { validateRow } from "@/utils/rowValidation";
import type { Ref } from "vue";

// this mega module is for finalizing/deleting a row, locally and in the server

interface UseFinalizeRowOptions {
  tableData: TableData;
  deletedRows: Ref<TransactionRow[]>;
  addNotification: (
    message: string,
    type: NotificationType,
    duration?: number
  ) => void;
  setUndoRedo: (undo: string, redo: string) => void;
  setTableRows: (rows: TransactionRow[]) => void;
}

export function useFinalizeRow({
  tableData,
  deletedRows,
  addNotification,
  setUndoRedo,
  setTableRows,
}: UseFinalizeRowOptions) {
  const handleFinalize = (rowId: string) => {
    // look for row in display data
    const row = tableData.rowsDisplayed.find((row) => row.id === rowId);
    console.log("row", row);
    // if the row is finalized, delete row and its children
    if (row?.finalized) {
      const rowsToDelete = tableData.rowsOriginal.filter(
        (row) => row.id === rowId || row.parentId === rowId
      );
      // deletedRows.value.push(...rowsToDelete);

      API.updateTransaction(Operation.delete, row, setUndoRedo)
        .then(() => {
          // local delete by filtering out the rows to delete
          const newRows = tableData.rowsOriginal.filter(
            (row) => row.id !== rowId && row.parentId !== rowId
          );
          setTableRows(newRows);
          addNotification(
            `Deleted ${rowsToDelete.length} row${
              rowsToDelete.length > 1 ? "s" : ""
            }`,
            NotificationType.INFO
          );
        })
        .catch((error) => {
          addNotification(
            "Failed to delete row from server",
            NotificationType.ERROR
          );
          console.log("Failed to delete row from server", error);
          throw error;
        });
    } else if (row) {
      // if the row is not finalized, finalize it
      // todo: add validation, alert if missing fields
      const { valid, reason } = validateRow(row, true);
      if (!valid) {
        alert(reason);
        return;
      }

      // row prop changes
      row.finalized = true;
      // promote the row class (for appearance only) from pending row to actual type
      assignRowClass(row);

      // server change
      API.updateTransaction(Operation.finalize, row, setUndoRedo)
        .then((updatedRow) => {
          addNotification("Row finalized", NotificationType.INFO);
          // need to add row to tableData.rowsOriginal
          const newRows = [...tableData.rowsOriginal, row];
          setTableRows(newRows);
        })
        .catch((error) => {
          addNotification(
            "Failed to save row to server",
            NotificationType.ERROR
          );
          console.error("Failed to save row to server", error);
          throw error;
        });
    }
  };
  return {
    handleFinalize,
  };
}
