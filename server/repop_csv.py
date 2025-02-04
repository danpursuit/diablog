from components.TransactionDB import TransactionDB
from components.ManageCSV import ManageCSV

"""
# Initialize database and CSV plugin
db = TransactionDB()
csv_plugin = ManageCSV(db)

# Export current database to CSV
csv_plugin.save_to_csv("transactions_export.csv")

# Import from CSV (clearing existing data)
csv_plugin.populate_from_csv("transactions_import.csv", clear_existing=True)

# Import from CSV (keeping existing data)
csv_plugin.populate_from_csv("transactions_import.csv", clear_existing=False)
"""

fname = "data/transactions_export.csv"

db = TransactionDB()
csv_plugin = ManageCSV(db)

# Export current database to CSV
# csv_plugin.save_to_csv(fname)

# Import from CSV (clearing existing data)
csv_plugin.populate_from_csv(fname, clear_existing=True)
