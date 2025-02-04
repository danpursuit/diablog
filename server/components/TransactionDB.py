import sqlite3
from typing import List, Optional, Tuple
from dataclasses import asdict
import os
import json

from serverType.TransactionRow import TransactionRow
from serverType.RowType import RowType
from utils.txId import newTxId

# Every TransactionRow schema change:
# Update the functions
# - init_db
# - row_to_transaction
# - insert_transaction
# - insert_batch
# - update_transaction
# Can go to repop_csv to regenerate, after updating:
# - ManageCSV.dict_to_row
# - ManageCSV.row_to_dict
# To fill with demo transactions, update:
# - delete data/transactions.db to clear db
# - update server/data/demo_tx.py with new fields


class TransactionDB:
    def __init__(self, db_path: str = "data/transactions.db"):
        self.db_path = db_path
        self.init_db()

    def init_db(self):
        """Initialize the database with the transactions table."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS transactions (
                    id TEXT PRIMARY KEY,
                    isSubRow BOOLEAN NOT NULL,
                    parentId TEXT,
                    date TEXT,
                    rowType TEXT NOT NULL,
                    inAmount REAL,
                    inCurrency TEXT,
                    outAmount REAL,
                    outCurrency TEXT,
                    feeAmount REAL,
                    feeCurrency TEXT,
                    usdValue REAL,
                    network TEXT,
                    tags TEXT,
                    note TEXT
                )
            """)
            # Create index for faster lookups
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_date ON transactions(date)")

    def row_to_transaction(self, row: tuple) -> TransactionRow:
        """Convert a database row to a TransactionRow object."""
        return TransactionRow(
            id=row[0],
            isSubRow=bool(row[1]),
            parentId=row[2],
            date=row[3],
            rowType=RowType[row[4]],
            inAmount=row[5],
            inCurrency=row[6],
            outAmount=row[7],
            outCurrency=row[8],
            feeAmount=row[9],
            feeCurrency=row[10],
            usdValue=row[11],
            network=row[12],
            tags=json.loads(row[13]) if row[13] else [],
            note=row[14],
        )

    def insert_transaction(self, tx: TransactionRow) -> None:
        """Insert a new transaction."""
        with sqlite3.connect(self.db_path) as conn:
            # check if id exists; raise error if it does
            cursor = conn.execute(
                "SELECT COUNT(*) FROM transactions WHERE id=?", (tx.id,))
            if cursor.fetchone()[0] > 0:
                raise ValueError(f"Transaction {tx.id} already exists")

            # insert transaction
            conn.execute("""
                INSERT INTO transactions VALUES 
                (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (
                tx.id, tx.isSubRow, tx.parentId, tx.date, tx.rowType.name,
                tx.inAmount, tx.inCurrency, tx.outAmount, tx.outCurrency,
                tx.feeAmount, tx.feeCurrency, tx.usdValue, tx.network, json.dumps(
                    tx.tags), tx.note,
            ))

    def insert_batch(self, txs: List[TransactionRow]) -> None:
        """Insert a new transaction."""
        with sqlite3.connect(self.db_path) as conn:
            # insert transaction
            conn.executemany("""
                INSERT INTO transactions VALUES 
                (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, [(tx.id, tx.isSubRow, tx.parentId, tx.date, tx.rowType.name,
                   tx.inAmount, tx.inCurrency, tx.outAmount, tx.outCurrency,
                   tx.feeAmount, tx.feeCurrency, tx.usdValue, tx.network, json.dumps(tx.tags), tx.note,) for tx in txs])

    def update_transaction(self, tx: TransactionRow) -> bool:
        """Update an existing transaction."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                UPDATE transactions 
                SET parentId=?, date=?, rowType=?, inAmount=?, inCurrency=?,
                    outAmount=?, outCurrency=?, feeAmount=?, feeCurrency=?,
                    usdValue=?, network=?, tags=?, note=?, isSubRow=?
                WHERE id=?
            """, (
                tx.parentId, tx.date, tx.rowType.name,
                tx.inAmount, tx.inCurrency, tx.outAmount, tx.outCurrency,
                tx.feeAmount, tx.feeCurrency, tx.usdValue, tx.network, json.dumps(
                    tx.tags), tx.note,
                tx.isSubRow, tx.id
            ))
            return cursor.rowcount > 0

    def delete_transaction(self, tx: TransactionRow) -> bool:
        """Delete a transaction."""
        with sqlite3.connect(self.db_path) as conn:
            # cursor = conn.execute(
            #     "DELETE FROM transactions WHERE id=?", (tx.id,))
            # delete where id is equal to tx.id or parentId is equal to tx.id
            cursor = conn.execute(
                "DELETE FROM transactions WHERE id=? OR parentId=?", (tx.id, tx.id))
            return True

    def delete_transaction_by_id(self, tx_id: str) -> bool:
        """Delete a transaction."""
        with sqlite3.connect(self.db_path) as conn:
            # cursor = conn.execute(
            #     "DELETE FROM transactions WHERE id=?", (tx.id,))
            # delete where id is equal to tx.id or parentId is equal to tx.id
            cursor = conn.execute(
                "DELETE FROM transactions WHERE id=? OR parentId=?", (tx_id, tx_id))
            return True

    def get_self_and_children(self, tx_id: str) -> List[TransactionRow]:
        """Get a transaction and all its children."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "SELECT * FROM transactions WHERE id=? OR parentId=?", (tx_id, tx_id))
            return [self.row_to_transaction(row) for row in cursor.fetchall()]

    def get_all_transactions(self) -> List[TransactionRow]:
        """Get all transactions."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("SELECT * FROM transactions")
            return [self.row_to_transaction(row) for row in cursor.fetchall()]

    def get_transaction(self, tx_id: str) -> Optional[TransactionRow]:
        """Get a transaction by ID."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "SELECT * FROM transactions WHERE id=?", (tx_id,))
            row = cursor.fetchone()
            return self.row_to_transaction(row) if row else None

    def on_init(self, demo_transactions: List[TransactionRow]) -> List[TransactionRow]:
        """Initialize the database with demo data if empty."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("SELECT COUNT(*) FROM transactions")
            if cursor.fetchone()[0] == 0:
                # Database is empty, insert demo data
                for tx in demo_transactions:
                    print(f'Inserting {tx}')
                    self.insert_transaction(tx)
                print('Created new db with demo data')
                return demo_transactions
            else:
                tx = self.get_all_transactions()
                print(f'Loaded {len(tx)} transactions from db')
                return tx

    def restore_from_dbfile(self, dbfile: str) -> None:
        """Restore database from a backup file."""
        os.replace(dbfile, self.db_path)
