from enum import Enum
from typing import Optional, Any, List, Tuple
from pydantic import BaseModel, Field
import sqlite3
import datetime

from serverType.TransactionRow import TransactionRow
from components.TransactionDB import TransactionDB
from components.ManageCSV import ManageCSV


class OperationType(Enum):
    ADD_TRANSACTION = "add_transaction"
    UPDATE_TRANSACTION = "update_transaction"
    DELETE_TRANSACTION = "delete_transaction"
    REWRITE_TABLE = "rewrite_table"


class Operation(BaseModel):
    type: OperationType
    timestamp: datetime.datetime = Field(default_factory=datetime.datetime.now)
    # For undo
    undo_data: dict[str, Any]
    # For redo
    redo_data: dict[str, Any]

    def description(self) -> str:
        if self.type == OperationType.ADD_TRANSACTION:
            return f"finalize 1 transaction"
        elif self.type == OperationType.UPDATE_TRANSACTION:
            return f"update 1 transaction"
        elif self.type == OperationType.DELETE_TRANSACTION:
            return f"delete {len(self.undo_data['txs'])} transactions"
        elif self.type == OperationType.REWRITE_TABLE:
            return f"load from csv"
        return "Unknown operation"


class History:
    def __init__(self, db: TransactionDB):
        self.db = db
        self.operations: List[Operation] = []
        self.current_index: int = -1  # Points to last executed operation

    def append_operation(self, operation: Operation):
        # Remove any operations after current_index if we're in the middle of the history
        if self.current_index < len(self.operations) - 1:
            self.operations = self.operations[:self.current_index + 1]

        self.operations.append(operation)
        self.current_index += 1

    def new_add(self, tx: TransactionRow):
        operation = Operation(
            type=OperationType.ADD_TRANSACTION,
            undo_data={"tx_id": tx.id},
            redo_data={"tx": tx}
        )
        self.append_operation(operation)

    def new_update(self, updated_tx: TransactionRow):
        # get the old transaction by id
        old_tx = self.db.get_transaction(updated_tx.id)
        if not old_tx:
            raise Exception(
                f"History Error: Transaction {updated_tx.id} not found")
        operation = Operation(
            type=OperationType.UPDATE_TRANSACTION,
            undo_data={"tx": old_tx},
            redo_data={"tx": updated_tx}
        )
        self.append_operation(operation)

    def new_delete(self, tx: TransactionRow):
        # get tx and its children
        old_txs = self.db.get_self_and_children(tx.id)
        if not old_txs:
            raise Exception(
                f"History Error: Transaction {tx.id}/children not found")
        operation = Operation(
            type=OperationType.DELETE_TRANSACTION,
            undo_data={"txs": old_txs},
            redo_data={"tx_id": tx.id}
        )
        self.append_operation(operation)

    def new_csv_rewrite(self, backup_db_path: str, new_csv_fname: str):
        operation = Operation(
            type=OperationType.REWRITE_TABLE,
            undo_data={"db_fname": backup_db_path},
            redo_data={"csv_fname": new_csv_fname}
        )
        self.append_operation(operation)

    def can_undo(self) -> bool:
        return self.current_index >= 0

    def can_redo(self) -> bool:
        return self.current_index < len(self.operations) - 1

    def get_actions(self) -> Tuple[str, str]:
        print('getting actions', self.current_index, self.operations)
        undo_action = self.operations[self.current_index].description(
        ) if self.can_undo() else ""
        redo_action = self.operations[self.current_index +
                                      1].description() if self.can_redo() else ""
        return undo_action, redo_action

    def undo(self) -> bool:
        if not self.can_undo():
            raise Exception("No operations to undo")

        operation = self.operations[self.current_index]
        success = self._execute_undo(operation)
        if success:
            self.current_index -= 1
        return success

    def redo(self) -> bool:
        if not self.can_redo():
            return False

        next_operation = self.operations[self.current_index + 1]
        success = self._execute_redo(next_operation)
        if success:
            self.current_index += 1
        return success

    def _execute_undo(self, operation: Operation) -> bool:
        try:
            if operation.type == OperationType.ADD_TRANSACTION:
                self.db.delete_transaction_by_id(operation.undo_data["tx_id"])
            elif operation.type == OperationType.UPDATE_TRANSACTION:
                self.db.update_transaction(operation.undo_data["tx"])
            elif operation.type == OperationType.DELETE_TRANSACTION:
                self.db.insert_batch(operation.undo_data["txs"])
            elif operation.type == OperationType.REWRITE_TABLE:
                # Load the original db state from db_fname
                self.db.restore_from_dbfile(operation.undo_data["db_fname"])

            return True

        except Exception as e:
            print(f"Error during undo: {str(e)}")
            raise e

    def _execute_redo(self, operation: Operation) -> bool:
        try:
            with sqlite3.connect(self.db.db_path) as conn:
                if operation.type == OperationType.ADD_TRANSACTION:
                    self.db.insert_transaction(operation.redo_data["tx"])
                elif operation.type == OperationType.UPDATE_TRANSACTION:
                    self.db.update_transaction(operation.redo_data["tx"])
                elif operation.type == OperationType.DELETE_TRANSACTION:
                    # if tx_id has children, all will be deleted here
                    self.db.delete_transaction_by_id(
                        operation.redo_data["tx_id"])
                elif operation.type == OperationType.REWRITE_TABLE:
                    # Load the new db state from csv
                    csv_plugin = ManageCSV(self.db)
                    backup_db_path = csv_plugin.populate_from_csv(
                        operation.redo_data["csv_fname"], clear_existing=True)
                    operation.undo_data["db_fname"] = backup_db_path

                return True

        except Exception as e:
            print(f"Error during redo: {str(e)}")
            return False
