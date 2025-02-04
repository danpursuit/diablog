import random
import time


def newTxId():
    timestamp = int(time.time() * 1000)  # this part is same as client side
    random_part = random.randint(100000, 999999)
    return f"t-{timestamp}-{random_part}"
