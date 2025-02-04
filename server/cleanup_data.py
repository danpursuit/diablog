import os
import time
from datetime import datetime, timedelta

skip_files = ["transactions_export.csv", "transactions.db"]
search_extensions = [".csv", ".db"]


def find_old_files(directory, days=2, remove=False):
    # Get the current time
    now = time.time()

    # Calculate the cutoff time
    cutoff = now - (days * 86400)  # 86400 seconds in a day

    # List all files in the directory
    for filename in os.listdir(directory):
        valid_file = filename not in skip_files and any(
            filename.endswith(ext) for ext in search_extensions)
        if valid_file:
            # Get the full path to the file
            file_path = os.path.join(directory, filename)

            # Get the file's last modified time
            file_mtime = os.path.getmtime(file_path)

            # Check if the file is older than the cutoff time
            if file_mtime < cutoff:
                # Print the name of the file
                print(f"Old file: {filename} {file_mtime}")
                if remove:
                    # Delete the file
                    os.remove(file_path)
                    print(f"Deleted {filename}")
