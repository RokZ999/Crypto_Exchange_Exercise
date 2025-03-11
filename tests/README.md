## Testing Overview

The testing suite validates the API's core functionality including:
- Balance retrieval
- Withdrawal transactions
- Deposit transactions
- Error handling and validation

The tests use a real PostgreSQL database with test data to ensure the API behaves correctly in realistic scenarios.

## Test Directory Structure

```
.
├── tests/
│   ├── api.spec.ts         # Main test specifications
├── playwright.config.ts    # Playwright configuration
├── package.json            # Node.js dependencies
├── Dockerfile              # Docker configuration for tests
└── .env                    # Environment variables for tests
```

## Setting Up the Test Environment

### Environment Variables

Create a `.env` file in your test directory with the following variables:

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

### Installing Dependencies

```bash
npm install
```

This will install all necessary dependencies including:
- @playwright/test
- pg (PostgreSQL client)
- dotenv

## Running Tests

### Local Testing

1. Make sure your API is running locally or in a container
2. Run the tests:

```bash
npx playwright test
```

## Test Cases

The test suite (`api.spec.ts`) includes the following test scenarios:

### API Status Check
- Verifies that the API is running and responds to requests

### Balance Endpoint Tests
- Retrieves and validates balances for different users and assets
- Tests error handling for non-existent users/assets

### Withdrawal Endpoint Tests
- Processes valid withdrawals and verifies balance changes
- Tests validation of insufficient funds
- Tests error handling for invalid inputs
- Tests edge cases with cross-asset transfers

### Deposit Endpoint Tests
- Processes valid deposits and verifies balance changes
- Tests validation of asset existence
- Tests error handling for invalid inputs

## Test Database Setup

The test suite automatically:
1. Connects to the PostgreSQL database
2. Cleans up any previous test data
3. Seeds the database with test users, assets, and wallets
4. Runs all tests against this controlled environment
5. Closes database connections properly after tests complete

## Test Data

The test suite creates the following test data:

### Users
- test_user1 (userId1)
- test_user2 (userId2)

### Assets
- Bitcoin (BTC)
- Ethereum (ETH)
- Ripple (XRP)

### Wallets
- User1's BTC wallet with 1.5 BTC
- User1's ETH wallet with 2.0 ETH
- User2's BTC wallet with 3.0 BTC
- User2's XRP wallet with 5000 XRP
