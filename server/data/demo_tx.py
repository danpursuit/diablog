from serverType.TransactionRow import TransactionRow
from serverType.RowType import RowType
from utils.txId import newTxId

demo_tx = [
    TransactionRow(
        id=newTxId(),
        parentId=None,
        date="2025-01-03",
        rowType=RowType.TRADE,
        inAmount=16990.81,
        inCurrency="USDC",
        outAmount=4000,
        outCurrency="VIRTUAL",
        feeAmount=0,
        feeCurrency="ETH",
        usdValue=16990.81,
        network='Ethereum',
        tags=['test'],
        note="test transaction",
        isSubRow=False
    ),
    TransactionRow(
        id=newTxId(),
        parentId=None,
        date="2025-01-04",
        rowType=RowType.TRADE,
        inAmount=6417.46,
        inCurrency="AERO",
        outAmount=10000,
        outCurrency="USDC",
        feeAmount=0,
        feeCurrency="ETH",
        usdValue=6417.46,
        network='Ethereum',
        tags=['test'],
        note="",
        isSubRow=False
    ),
]
