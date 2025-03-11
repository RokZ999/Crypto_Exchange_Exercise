from contextlib import asynccontextmanager

from fastapi import FastAPI

from api.main_router import main_api_router
from database import create_db_and_tables, drop_db_and_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(
    lifespan=lifespan,
    title="Simple API",
    description="Simple API for homework",
    version="1.0.0",
    swagger_ui_parameters={"syntaxHighlight": False}

)

@app.get("/")
async def root():
    return {"status": "ok"}
app.include_router(main_api_router)