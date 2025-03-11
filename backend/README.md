# Simple Transaction API

A RESTful API for managing cryptocurrency transactions and balances. This project provides endpoints for creating withdrawal and deposit transactions, as well as checking account balances.

## Features

- Create withdrawal transactions
- Create deposit transactions
- Check asset balances for users
- PostgreSQL database integration
- FastAPI framework with auto-generated Swagger/OpenAPI documentation

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **SQLModel**: SQL database interaction layer built on top of SQLAlchemy
- **PostgreSQL**: Robust relational database
- **Docker**: Containerization for easy deployment
- **Python 3.11**: Modern Python for robust type hinting

## Project Structure

```
.
├── api/
│   ├── exceptions.py       # Exception handling and error responses
│   ├── main_router.py      # Main API router configuration
│   ├── routes/
│       ├── balances.py     # Balance endpoint implementation
│       └── transactions.py # Transaction endpoints implementation
├── database.py             # Database connection and configuration
├── log_config.py           # Logging configuration
├── main.py                 # FastAPI application entry point
├── models.py               # Data models and database schema
├── .env                    # Environment variables (not included in repo)
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose configuration
└── README.md               # Project documentation
```

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```
# PostgreSQL Database
POSTGRES_USER=user1
POSTGRES_PW=user1Password
POSTGRES_DB=postgres
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# API URL
API_URL=http://localhost:8000

# CI Environment
CI=true
```

## Running the API Locally

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up a PostgreSQL database and update the `.env` file

3. Run the FastAPI application:
```bash
uvicorn main:app --reload
```

## API Endpoints

### Create Withdrawal Transaction

```
POST /create/withdrawal
```

Request body:
```json
{
  "user_id": 1,
  "asset_id": 1,
  "amount": 0.01,
  "address": "0xb723df0bbc9f992e5895db9d62cbf07acdf9ff96"
}
```

### Create Deposit Transaction

```
POST /create/deposit
```

Request body:
```json
{
  "asset_id": 1,
  "amount": 0.01,
  "address": "0xec23bf4d8d8caa6976135d81e4bdfaf4384b49bc"
}
```

### Get Balance

```
GET /balance/{user_id}/{asset_id}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `404`: Asset or user not found
- `422`: Insufficient funds for withdrawal
- `500`: Internal server error

## Automated Testing

The project includes a test suite built with Playwright and TypeScript to validate API functionality.