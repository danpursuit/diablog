from typing import List, Optional
from fastapi import HTTPException, status, UploadFile
import traceback
import datetime

import cfg
from components.TransactionDB import TransactionDB
from components.History import History
from components.ManageCSV import ManageCSV
from serverType.TransactionRow import TransactionRow
from data.demo_tx import demo_tx


class TransactionAPI:
    def __init__(self):
        self.db = TransactionDB()
        self.history = History(self.db)
        # self.tx_list: List[TransactionRow] = []
        self.initialize()

        self.recently_deleted: List[List[TransactionRow]] = []

    def initialize(self):
        """Initialize both in-memory list and database."""
        # If DB is empty, it will be populated with demo_transactions
        self.db.on_init(demo_tx)

    def add_transaction(self, transaction: TransactionRow) -> TransactionRow:
        """Add a new transaction to both in-memory list and database."""
        try:
            self.history.new_add(transaction)
            self.db.insert_transaction(transaction)
            return transaction
        except Exception as e:
            print(
                f'Error in add_transaction: {transaction}. Full traceback: {traceback.format_exc()}')
            raise HTTPException(
                status_code=500, detail=f"Failed to add transaction: {str(e)}")

    def update_transaction(self, updated_tx: TransactionRow) -> TransactionRow:
        """Update transaction in both in-memory list and database."""
        try:
            self.history.new_update(updated_tx)
            self.db.update_transaction(updated_tx)
            return updated_tx
        except Exception as e:
            print(
                f'Error in update_transaction: {updated_tx}. Full traceback: {traceback.format_exc()}')
            raise HTTPException(
                status_code=500, detail=f"Failed to update transaction: {str(e)}")

    def delete_transaction(self, deleted_tx: TransactionRow) -> TransactionRow:
        """Delete transaction from both in-memory list and database."""
        try:
            self.history.new_delete(deleted_tx)
            self.db.delete_transaction(deleted_tx)
            return deleted_tx
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to delete transaction: {str(e)}")

    def get_transaction(self, tx_id: str) -> Optional[TransactionRow]:
        """Get a transaction by ID from in-memory list."""
        tx = self.db.get_transaction(tx_id)
        if tx:
            return tx
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction {tx_id} not found"
        )

    def get_all_transactions(self) -> List[TransactionRow]:
        """Get all transactions from in-memory list."""
        return self.db.get_all_transactions()

    async def ingest_csv(self, file: UploadFile):
        # save uploaded file
        print('ingeststep1')
        new_csv_path = f"{cfg.data_path}temp_upload_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        with open(new_csv_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        print('ingeststep2')

        csv_plugin = ManageCSV(self.db)
        backup_db_path = csv_plugin.populate_from_csv(
            new_csv_path, clear_existing=True)
        print('ingeststep3')
        self.history.new_csv_rewrite(backup_db_path, new_csv_path)

        return backup_db_path

    def get_undo_redo(self):
        undo, redo = self.history.get_actions()
        return {
            "undo": undo,
            "redo": redo
        }

    def undo(self) -> bool:
        # for now, return entire table after these transactions
        # if needed later can make more efficient

        self.history.undo()
        undo, redo = self.history.get_actions()
        table = self.db.get_all_transactions()
        return {
            "undo": undo,
            "redo": redo,
            "table": table
        }

    def redo(self) -> bool:
        self.history.redo()
        undo, redo = self.history.get_actions()
        table = self.db.get_all_transactions()
        print('redo transactions:', table)
        return {
            "undo": undo,
            "redo": redo,
            "table": table
        }


# FastAPI route handlers in main
# @app.post("/transactions/", response_model=TransactionRow)
# async def create_transaction(transaction: TransactionRow):
#     return transaction_api.add_transaction(transaction)


# @app.put("/transactions/{tx_id}", response_model=TransactionRow)
# async def update_transaction(tx_id: str, transaction: TransactionRow):
#     return transaction_api.update_transaction(tx_id, transaction)


# @app.delete("/transactions/{tx_id}")
# async def delete_transaction(tx_id: str):
#     transaction_api.delete_transaction(tx_id)
#     return {"message": "Transaction deleted"}


# @app.get("/transactions/{tx_id}", response_model=Optional[TransactionRow])
# async def get_transaction(tx_id: str):
#     tx = transaction_api.get_transaction(tx_id)
#     if tx is None:
#         raise HTTPException(
#             status_code=404, detail=f"Transaction {tx_id} not found")
#     return tx


# @app.get("/transactions/", response_model=List[TransactionRow])
# async def get_transactions():
#     return transaction_api.get_all_transactions()
