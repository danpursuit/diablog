import csv
from typing import List
from dataclasses import asdict, fields
from datetime import datetime
import sqlite3
import os
import traceback

import cfg
from data.demo_tx import demo_tx
from serverType.TransactionRow import TransactionRow
from serverType.RowType import RowType
from components.TransactionDB import TransactionDB


class ManageCSV:
    def __init__(self, db: TransactionDB):
        self.db = db

    def get_csv_headers(self) -> List[str]:
        """Get field names from TransactionRow dataclass."""
        with sqlite3.connect(self.db.db_path) as conn:
            cursor = conn.execute("SELECT * FROM transactions")
            headers = [desc[0] for desc in cursor.description]
            print('got headers', headers)
            return headers

    def row_to_dict(self, headers: List[str], tx: TransactionRow) -> dict:
        """Convert TransactionRow to dict with proper string conversions."""
        row_dict = {
            header: getattr(tx, header) for header in headers if hasattr(tx, header)
        }
        # Convert enums to strings
        row_dict['rowType'] = tx.rowType.name if tx.rowType else None
        row_dict['tags'] = ', '.join(tx.tags) if tx.tags else None
        # Convert None to empty string for CSV
        return {k: ('' if v is None else v) for k, v in row_dict.items()}

    def dict_to_row(self, row: dict) -> TransactionRow:
        """Convert CSV dict to TransactionRow with proper type conversions."""
        # Convert empty strings back to None
        row = {k: (None if v == '' else v) for k, v in row.items()}

        # Convert string values to appropriate types
        if row['inAmount']:
            row['inAmount'] = float(row['inAmount'])
        if row['outAmount']:
            row['outAmount'] = float(row['outAmount'])
        if row['feeAmount']:
            if row['feeAmount'].lower() in 'auto':
                row['feeAmount'] = 'auto'
            else:
                row['feeAmount'] = float(row['feeAmount'])
        if row['usdValue']:
            row['usdValue'] = float(row['usdValue'])

        row['isSubRow'] = str(row['isSubRow']).lower(
        ) == 'true' if row['isSubRow'] else False

        if row['rowType']:
            row['rowType'] = RowType[row['rowType']]

        if row['tags']:
            row['tags'] = [tag.strip() for tag in row['tags'].split(',')]
            print('tags for row', row['tags'])
        else:
            row['tags'] = []

        # Create TransactionRow object
        return TransactionRow(**row)

    def save_to_csv(self, filepath: str) -> None:
        """Save current database state to CSV file."""
        try:
            # Get all transactions from database
            transactions = self.db.get_all_transactions()

            headers = self.get_csv_headers()

            with open(filepath, 'w', newline='') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=headers)
                writer.writeheader()

                for tx in transactions:
                    writer.writerow(self.row_to_dict(headers, tx))

            print(
                f"Successfully exported {len(transactions)} transactions to {filepath}")

        except Exception as e:
            raise Exception(f"Failed to save CSV: {str(e)}")

    def populate_from_csv(self, filepath: str, clear_existing: bool = True) -> str:
        """Populate database from CSV file. Returns path to backup dbfile."""
        try:
            # Read all transactions from CSV
            with open(filepath, 'r', newline='') as csvfile:
                reader = csv.DictReader(csvfile)
                transactions = [self.dict_to_row(row) for row in reader]

            # Create backup of current database
            backup_db_path = f"{cfg.data_path}transactions_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
            with sqlite3.connect(self.db.db_path) as conn:
                backup = sqlite3.connect(backup_db_path)
                conn.backup(backup)
                backup.close()

            try:
                with sqlite3.connect(self.db.db_path) as conn:
                    if clear_existing:
                        # Clear existing transactions
                        print('dropping table')
                        conn.execute("DROP TABLE IF EXISTS transactions")
                        print('recreating table')
                        self.db.init_db()

                    # Insert new transactions
                    for tx in transactions:
                        print('insert id', tx.id)
                        self.db.insert_transaction(tx)

                print(
                    f"Successfully imported {len(transactions)} transactions from {filepath}")

            except Exception as e:
                # Restore from backup if import fails
                os.replace(backup_db_path, self.db.db_path)
                raise Exception(
                    f"Failed to import CSV, database restored from backup: {str(e)}")
            return backup_db_path

        except Exception as e:
            print(traceback.format_exc())
            raise Exception(f"Failed to import CSV: {str(e)}")


# Usage example:
"""
# Initialize database and CSV plugin
db = TransactionDB()
csv_plugin = TransactionCSVPlugin(db)

# Export current database to CSV
csv_plugin.save_to_csv("transactions_export.csv")

# Import from CSV (clearing existing data)
csv_plugin.populate_from_csv("transactions_import.csv", clear_existing=True)

# Import from CSV (keeping existing data)
csv_plugin.populate_from_csv("transactions_import.csv", clear_existing=False)
"""
