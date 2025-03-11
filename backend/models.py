import warnings
import enum

from decimal import Decimal
from datetime import datetime
from sqlalchemy import Enum
from sqlmodel import Field, SQLModel

warnings.filterwarnings('ignore')

class Users(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True, max_length=50)
    created_at: datetime = Field(default_factory=datetime.now)


class Asset(SQLModel, table=True):
    """ Asset model """
    id: int | None = Field(default=None, primary_key=True)
    symbol: str = Field(unique=True, index=True, max_length=10)
    name: str = Field(unique=True, max_length=255)
    created_at: datetime = Field(default_factory=datetime.now)


class TransactionType(str, enum.Enum):
    WITHDRAWAL = "withdrawal"
    DEPOSIT = "deposit"


class Transaction(SQLModel, table=True):
    """ Transaction model """
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=True)
    asset_id: int = Field(foreign_key="asset.id", nullable=False)
    type: TransactionType = Field(sa_type=Enum(TransactionType))
    amount: Decimal = Field(gt=0)
    address: str = Field(nullable=False, max_length=62)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class TransactionWithdraw(SQLModel):
    """ Withdrawal model """
    user_id: int = Field(foreign_key="users.id", nullable=False)
    asset_id: int = Field(foreign_key="asset.id", nullable=False)
    amount: Decimal = Field(gt=0)
    address: str = Field(nullable=False, max_length=62)

    model_config = {
        "json_schema_extra": {
            "example": {
                "user_id": 1,
                "asset_id": 1,
                "amount": 0.01,
                "address": "0xb723df0bbc9f992e5895db9d62cbf07acdf9ff96"
            }
        }
    }


class TransactionDeposit(SQLModel):
    """ Deposit model """
    asset_id: int = Field(foreign_key="asset.id", nullable=False)
    amount: Decimal = Field(gt=0)
    address: str = Field(foreign_key="wallet.address", nullable=False, max_length=62)

    model_config = {
        "json_schema_extra": {
            "example": {
                "asset_id": 1,
                "amount": 0.01,
                "address": "0xec23bf4d8d8caa6976135d81e4bdfaf4384b49bc"
            }
        }
    }


class Wallet(SQLModel, table=True):
    """ Wallet model """
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    asset_id: int = Field(foreign_key="asset.id", index=True, nullable=False)
    address: str = Field(unique=True, index=True, max_length=62)
    amount: Decimal = Field(default=0, ge=0)
    updated_at: datetime = Field(default_factory=datetime.now)
