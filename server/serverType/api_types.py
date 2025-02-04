from pydantic import BaseModel, Field
from typing import Literal

from serverType.TransactionRow import TransactionRow


class TransactionUpdate(BaseModel):
    operation: Literal["update", "delete", "finalize"]
    row: TransactionRow
