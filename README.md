# QA_Automation_Engineer_Homework 

## Tech Stack

**Tests:** [README.MD](tests/README.md)
- **Playwright**
- **TypeScript**

**Backend:** [README.MD](backend/README.md)
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLModel**: SQL database interaction layer built on top of SQLAlchemy
- **PostgreSQL**: Robust relational database
- **Docker**: Containerization for easy deployment
- **Python 3.11**: Modern Python for robust type hinting

## Project Structure

```
├── .github/
│   └── workflows/          # GitHub Actions workflows
├── backend/                # Backend code
├── tests/                  # Test files
│   ├── api.spec.ts         # Main test specifications
├── playwright.config.ts    # Playwright configuration
├── package.json            # Node.js dependencies
├── Dockerfile              # Docker configuration for tests
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore configuration
├── README.md               # Project documentation
├── docker-compose.override.yml # Docker Compose override file
└── docker-compose.yml      # Main Docker Compose configuration
```

## Prerequisites

- Docker and Docker Compose

## Environment Setup

Rename a `.env.example` -> `.env` and change credentials if needed.

## Running Local PostgreSQL + API (Python) +  Tests (Playwright, Typescript)

1. Build and start the containers:
```bash
git clone https://github.com/RokZ999/QA_Automation_Engineer_Homework
docker-compose up -d
```
2. The API will be available at http://localhost:8000
3. The result of suite will be in /playwright-report 

## Github actions - artifacts (Report of testrun CI/CD)
Example of artifacts https://github.com/RokZ999/QA_Automation_Engineer_Homework/actions/runs/13793507198/artifacts/2731570460
