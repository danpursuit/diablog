from enum import Enum


class RowType(str, Enum):
    TRADE = "Trade"
    BRIDGEIN = "Bridge In"
    BRIDGEOUT = "Bridge Out"
    INIT = "Initiate"
    REWARD = "Reward"
    LOSS = "Loss"
    subEXTRAOUT = "↪extraOut"
    subEXTRAIN = "↪extraIn"
    BORROW = "Borrow"
    subREBUY = "↪ReBuy"
    REPAY = "Repay"
    subPRINCIPLE = "↪Principle"
    subINTEREST = "↪Interest"
    ERROR = "ERROR"
    subERROR = "↪ERROR"
    # Add other row types as needed
