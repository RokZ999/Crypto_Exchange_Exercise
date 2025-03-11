from fastapi import APIRouter
from api.routes import transactions, balances
from log_config import log

log.info("Initializing main router")

main_api_router = APIRouter()
main_api_router.include_router(transactions.router)
main_api_router.include_router(balances.router)

log.info("Routers included successfully")