from dataclasses import dataclass
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Union, Literal
from serverType.RowType import RowType


class TransactionRow(BaseModel):
    # state management
    id: str
    parentId: Optional[str] = None
    isSubRow: bool
    # columns
    date: str
    rowType: RowType
    inAmount: Optional[Union[float, None]]
    inCurrency: Optional[str]
    outAmount: Optional[Union[float, None]]
    outCurrency: Optional[str]
    feeAmount: Union[float, str, None]  # Can be "auto" or a number
    feeCurrency: Optional[str]
    usdValue: Optional[Union[float, None]]
    network: str
    tags: List[str]
    note: Optional[str]

    # config to ignore extra fields
    model_config = ConfigDict(extra='ignore')
