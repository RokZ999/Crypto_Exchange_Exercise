# QA 

## Tech Stack

**Tests:** [README.MD](https://github.com/RokZ999/testingggg/blob/main/tests/readme.md)
- **Playwright**
- **TypeScript**

**Backend:** [README.MD](https://github.com/RokZ999/testingggg/blob/main/backend/readme.md)
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLModel**: SQL database interaction layer built on top of SQLAlchemy
- **PostgreSQL**: Robust relational database
- **Docker**: Containerization for easy deployment
- **Python 3.11**: Modern Python for robust type hinting

## Project Structure

```

```

## Prerequisites

- Docker and Docker Compose

## Environment Setup

Rename a `.env.example` -> `.env` and change credentials if needed.

## Running PostgreSQL + API (Python) +  Tests (Playwright, Typescript)

1. Build and start the containers:
```bash
docker-compose up -d
```
2. The API will be available at http://localhost:8000
3. The result of suite will be in /playwright-report 
