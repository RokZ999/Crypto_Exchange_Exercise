from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select

from api.exceptions import UserNotFoundResponse, InsufficientFundsResponse, AssetNotFoundResponse
from database import engine
from log_config import log
from models import Transaction, TransactionWithdraw, TransactionDeposit, Users, Wallet, Asset

router = APIRouter(prefix="/create", tags=["transactions"])

@router.post(
    "/withdrawal",
    responses={
        403: {"model": UserNotFoundResponse},
        422: {"model": InsufficientFundsResponse},
    },
)
def create_withdrawal(transaction_data: TransactionWithdraw):
    log.info(f"Processing withdrawal: {transaction_data}")
    with Session(engine) as session:
        statement = select(Wallet).where(Wallet.user_id == transaction_data.user_id)
        wallet = session.exec(statement).first()

        if not wallet:
            log.warning(f"User {transaction_data.user_id} not found.")
            raise HTTPException(status_code=404, detail=f"User with id: {transaction_data.user_id} not found.")

        if wallet.amount < transaction_data.amount:
            log.warning(f"User {transaction_data.user_id} has insufficient funds.")
            raise HTTPException(status_code=422, detail=f"User with id: {transaction_data.user_id} does not have enough funds.")

        wallet.amount -= transaction_data.amount
        transaction = Transaction(
            user_id=transaction_data.user_id,
            asset_id=transaction_data.asset_id,
            type="withdrawal",
            amount=transaction_data.amount,
            address=transaction_data.address,
        )
        session.add(transaction)
        session.add(wallet)

        statement = select(Wallet).where(transaction.address == Wallet.address)
        wallet_on_same_exchange = session.exec(statement).first()
        if wallet_on_same_exchange:
            wallet_on_same_exchange.amount += transaction_data.amount
            session.add(wallet_on_same_exchange)

        session.commit()
        session.refresh(transaction)
        log.info(f"Withdrawal successful: {transaction}")
        return transaction

@router.post(
    "/deposit",
    responses={404: {"model": AssetNotFoundResponse}},
)
def create_deposit(transaction_data: TransactionDeposit):
    log.info(f"Processing deposit: {transaction_data}")
    with Session(engine) as session:
        statement = select(Asset).where(Asset.id == transaction_data.asset_id)
        asset_exists = session.exec(statement).first()

        if not asset_exists:
            log.warning(f"Asset {transaction_data.asset_id} not found.")
            raise HTTPException(status_code=404, detail=f"Asset with id: {transaction_data.asset_id} not found.")

        transaction = Transaction(
            asset_id=transaction_data.asset_id,
            type="deposit",
            amount=transaction_data.amount,
            address=transaction_data.address,
        )
        session.add(transaction)

        statement = select(Wallet).where(transaction.address == Wallet.address)
        wallet_on_same_exchange = session.exec(statement).first()
        if wallet_on_same_exchange:
            wallet_on_same_exchange.amount += transaction_data.amount
            session.add(wallet_on_same_exchange)

        session.commit()
        session.refresh(transaction)
        log.info(f"Deposit successful: {transaction}")
        return transaction