from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select

from api.exceptions import AssetUserNotFoundResponse
from database import engine
from log_config import log
from models import Wallet

router = APIRouter(prefix="/balance", tags=["balance"])


@router.get(
    path="/{user_id}/{asset_id}",
    responses={404: {"model": AssetUserNotFoundResponse}}
)
def get_balance(asset_id: int, user_id: int):
    log.info(f"Fetching balance for asset_id: {asset_id}, user_id: {user_id}")
    with Session(engine) as session:
        statement = select(Wallet).where(Wallet.user_id == user_id).where(Wallet.asset_id == asset_id)
        retrieved_wallet = session.exec(statement).first()

        if not retrieved_wallet:
            log.warning(f"Asset {asset_id} or user {user_id} not found.")
            raise HTTPException(status_code=404,
                                detail=f"Asset with id: {asset_id} or user with id: {user_id} not found.")

        log.info(f"Balance retrieved: {retrieved_wallet.amount}")
        return retrieved_wallet.amount
