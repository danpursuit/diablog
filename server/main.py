from fastapi import FastAPI, HTTPException, status, BackgroundTasks, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Union, Literal
import traceback
import datetime
import os

import cfg
from serverType.TransactionRow import TransactionRow
from components.TransactionAPI import TransactionAPI
from components.ManageCSV import ManageCSV

from serverType.RowType import RowType
from serverType.TransactionRow import TransactionRow
from serverType.api_types import TransactionUpdate
from cleanup_data import find_old_files

app = FastAPI()
api = TransactionAPI()
find_old_files(cfg.data_path, 1, True)


@app.get("/api/transactions", response_model=List[TransactionRow])
async def get_transactions():
    """Get all transactions"""
    try:
        return api.get_all_transactions()
    except Exception as e:
        print(f'Error in get_transactions: {e} {traceback.format_exc()}')
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/transactions", response_model=TransactionRow)
async def update_transaction(payload: TransactionUpdate):
    """Update, delete, or finalize a transaction"""
    try:
        if payload.operation == "delete":
            return api.delete_transaction(payload.row)

        elif payload.operation == "update":
            return api.update_transaction(payload.row)

        elif payload.operation == "finalize":
            return api.add_transaction(payload.row)

    except Exception as e:
        print(
            f'Error in update_transaction: {payload}. Full traceback: {traceback.format_exc()}')
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@app.get("/api/transactions/{transaction_id}", response_model=TransactionRow)
async def get_transaction(transaction_id: str):
    """Get a specific transaction by ID"""
    return api.get_transaction(transaction_id)


@app.get("/api/download-csv")
async def download_csv():
    try:
        # Generate CSV file
        csv_plugin = ManageCSV(api.db)
        export_path = f"{cfg.data_path}temp_export_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        csv_plugin.save_to_csv(export_path)

        # Return file and clean up after sending
        return FileResponse(
            path=export_path,
            filename="transactions.csv",
            media_type="text/csv",
        )

    except Exception as e:
        print(f'Error in download_csv: {e} {traceback.format_exc()}')
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/upload-csv")
async def upload_csv(file: UploadFile):
    try:
        await api.ingest_csv(file)

        return api.get_all_transactions()

    except Exception as e:
        # if os.path.exists(temp_path):
        #     os.remove(temp_path)
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/undo")
async def undo():
    try:
        return api.undo()
    except Exception as e:
        print(f'Error in undo: {e} {traceback.format_exc()}')
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/redo")
async def redo():
    try:
        return api.redo()
    except Exception as e:
        print(f'Error in redo: {e} {traceback.format_exc()}')
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/undo-redo")
async def get_undo_redo():
    try:
        return api.get_undo_redo()
    except Exception as e:
        print(f'Error in get_undo_redo: {e} {traceback.format_exc()}')
        raise HTTPException(status_code=400, detail=str(e))
