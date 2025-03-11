import { test, expect, request } from "@playwright/test";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.API_URL;

// Database configuration
const dbConfig = {
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST || "localhost",
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: Number(process.env.POSTGRES_PORT) || 5432,
};

// Create PostgreSQL connection pool
const pool = new Pool(dbConfig);

// Test data variables
let userId1: number, userId2: number;
let assetBTC: number, assetETH: number, assetXRP: number;
let address1 = "0x1723df0bbc9f992e5895db9d62cbf07acdf9ff96";
let address2 = "0x29f0d9cc91e2eb8a13c2eeb3e843de9f09b67894";
let address3 = "0x3723df0bbc9f992e5895db9d62cbf07acdf9ff96";
let address4 = "0x49f0d9cc91e2eb8a13c2eeb3e843de9f09b67894";

test.beforeAll(async () => {
  const client = await pool.connect();
  try {
    console.log("Cleaning up previous test data...");
    // Disable foreign key constraints temporarily
    await client.query("SET session_replication_role = 'replica';");

    // Truncate all tables in the correct order to avoid foreign key conflicts
    await client.query(
      "TRUNCATE TABLE transaction, wallet, users, asset RESTART IDENTITY;"
    );

    // Re-enable foreign key constraints
    await client.query("SET session_replication_role = 'origin';");

    console.log("Database cleanup completed.");

    console.log("Seeding test database...");

    // Insert assets
    await client.query(
      "INSERT INTO asset (symbol, name, created_at) VALUES ('BTC', 'Bitcoin', CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING"
    );
    await client.query(
      "INSERT INTO asset (symbol, name, created_at) VALUES ('ETH', 'Ethereum', CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING"
    );
    await client.query(
      "INSERT INTO asset (symbol, name, created_at) VALUES ('XRP', 'Ripple', CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING"
    );

    // Retrieve asset IDs
    const btc = await client.query("SELECT id FROM asset WHERE symbol = 'BTC'");
    const eth = await client.query("SELECT id FROM asset WHERE symbol = 'ETH'");
    const xrp = await client.query("SELECT id FROM asset WHERE symbol = 'XRP'");
    assetBTC = btc.rows[0].id;
    assetETH = eth.rows[0].id;
    assetXRP = xrp.rows[0].id;

    // Insert users
    await client.query(
      "INSERT INTO users (username, created_at) VALUES ('test_user1', CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING"
    );
    await client.query(
      "INSERT INTO users (username, created_at) VALUES ('test_user2', CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING"
    );

    // Retrieve user IDs
    const user1 = await client.query(
      "SELECT id FROM users WHERE username = 'test_user1'"
    );
    const user2 = await client.query(
      "SELECT id FROM users WHERE username = 'test_user2'"
    );
    userId1 = user1.rows[0].id;
    userId2 = user2.rows[0].id;

    // Insert wallets
    await client.query(
      "INSERT INTO wallet (user_id, asset_id, address, amount, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING",
      [userId1, assetBTC, address1, 1.5]
    );
    await client.query(
      "INSERT INTO wallet (user_id, asset_id, address, amount, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING",
      [userId1, assetETH, address2, 2.0]
    );
    await client.query(
      "INSERT INTO wallet (user_id, asset_id, address, amount, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING",
      [userId2, assetBTC, address3, 3.0]
    );
    await client.query(
      "INSERT INTO wallet (user_id, asset_id, address, amount, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING",
      [userId2, assetXRP, address4, 5000.0]
    );

    console.log("Database seeded successfully!");
  } finally {
    client.release();
  }
});

test("Check FastAPI status", async ({ request }) => {
  const response = await request.get(`${BASE_URL}`);
  expect(response.status()).toBe(200);
});

// GET /balance tests
test.describe("Balance Endpoint Tests", () => {
  test("Should return correct balance for user1's BTC", async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/balance/${userId1}/${assetBTC}`
    );
    expect(response.status()).toBe(200);
    const balance = await response.json();
    expect(balance).toBe(1.5);
  });

  test("Should return correct balance for user1's ETH", async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/balance/${userId1}/${assetETH}`
    );
    expect(response.status()).toBe(200);
    const balance = await response.json();
    expect(balance).toBe(2.0);
  });

  test("Should return correct balance for user2's BTC", async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/balance/${userId2}/${assetBTC}`
    );
    expect(response.status()).toBe(200);
    const balance = await response.json();
    expect(balance).toBe(3.0);
  });

  test("Should return correct balance for user2's XRP", async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/balance/${userId2}/${assetXRP}`
    );
    expect(response.status()).toBe(200);
    const balance = await response.json();
    expect(balance).toBe(5000.0);
  });

  test("Should return 404 for non-existent user-asset combination", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/balance/${userId1}/${assetXRP}`
    );
    expect(response.status()).toBe(404);
    const error = await response.json();
    expect(error.detail).toContain("not found");
  });

  test("Should return 404 for invalid asset ID", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/balance/${userId1}/9999`);
    expect(response.status()).toBe(404);
    const error = await response.json();
    expect(error.detail).toContain("not found");
  });
});

// POST /create/withdrawal tests
test.describe("Withdrawal Endpoint Tests", () => {
  test("Should successfully process a valid withdrawal", async ({
    request,
  }) => {
    const withdrawalData = {
      user_id: userId1,
      asset_id: assetBTC,
      amount: 0.5,
      address: address3, // Sending to user2's BTC address
    };

    const response = await request.post(`${BASE_URL}/create/withdrawal`, {
      data: withdrawalData,
    });

    expect(response.status()).toBe(200);
    const transaction = await response.json();
    expect(transaction.type).toBe("withdrawal");
    expect(transaction.amount).toBe("0.5");
    expect(transaction.user_id).toBe(userId1);
    expect(transaction.asset_id).toBe(assetBTC);

    // Verify user1's balance was reduced
    const balanceResponse = await request.get(
      `${BASE_URL}/balance/${userId1}/${assetBTC}`
    );
    const newBalance = await balanceResponse.json();
    expect(newBalance).toBe(1.0); // 1.5 - 0.5 = 1.0

    // Verify user2's balance was increased (internal transfer)
    const user2BalanceResponse = await request.get(
      `${BASE_URL}/balance/${userId2}/${assetBTC}`
    );
    const user2NewBalance = await user2BalanceResponse.json();
    expect(user2NewBalance).toBe(3.5); // 3.0 + 0.5 = 3.5
  });

  test("Should reject withdrawal with insufficient funds", async ({
    request,
  }) => {
    const withdrawalData = {
      user_id: userId1,
      asset_id: assetBTC,
      amount: 5.0, // More than available balance
      address: address3,
    };

    const response = await request.post(`${BASE_URL}/create/withdrawal`, {
      data: withdrawalData,
    });

    expect(response.status()).toBe(422);
    const error = await response.json();
    expect(error.detail).toContain("does not have enough funds");
  });

  test("Should reject withdrawal for non-existent user", async ({
    request,
  }) => {
    const withdrawalData = {
      user_id: 9999, // Non-existent user
      asset_id: assetBTC,
      amount: 0.1,
      address: address3,
    };

    const response = await request.post(`${BASE_URL}/create/withdrawal`, {
      data: withdrawalData,
    });

    expect(response.status()).toBe(404);
    const error = await response.json();
    expect(error.detail).toContain("not found");
  });

  test("Should reject withdrawal with invalid amount format", async ({
    request,
  }) => {
    const withdrawalData = {
      user_id: userId1,
      asset_id: assetBTC,
      amount: -0.5, // Negative amount
      address: address3,
    };

    const response = await request.post(`${BASE_URL}/create/withdrawal`, {
      data: withdrawalData,
    });

    expect(response.status()).toBe(422);
  });

  // For example user1 withdraw BTC to XRP Wallet in same exchange, and is still credit but in amount of sent BTC
  // user1 sent 0.1 btc to user2 xrp wallet (current ballance 5000)
  // user2 is credited (5000.1)
  test("Should wrong withdraw be credited (Intentionally False Test interesting edgecase)", async ({
    request,
  }) => {
    const startingXrpBalance = await request.get(
      `${BASE_URL}/balance/${userId2}/${assetXRP}`
    );
    const oldBalance = startingXrpBalance.json();

    const withdrawalData = {
      user_id: userId1,
      asset_id: assetBTC,
      amount: 0.1,
      address: address4,
    };

    const response = await request.post(`${BASE_URL}/create/deposit`, {
      data: withdrawalData,
    });

    // Status should be ok because treated as wrong address
    expect(response.status()).toBe(200);

    const updatedXrpBalance = await request.get(
      `${BASE_URL}/balance/${userId2}/${assetXRP}`
    );
    const newBalance = await updatedXrpBalance.json();
    expect(newBalance).toBe(oldBalance);
  });
});

// POST /create/deposit tests
test.describe("Deposit Endpoint Tests", () => {
  test("Should successfully process a valid deposit", async ({ request }) => {
    const depositData = {
      asset_id: assetETH,
      amount: 1.5,
      address: address2, // User1's ETH address
    };

    const response = await request.post(`${BASE_URL}/create/deposit`, {
      data: depositData,
    });

    expect(response.status()).toBe(200);
    const transaction = await response.json();
    expect(transaction.type).toBe("deposit");
    expect(transaction.amount).toBe("1.5");
    expect(transaction.asset_id).toBe(assetETH);

    // Verify balance was increased
    const balanceResponse = await request.get(
      `${BASE_URL}/balance/${userId1}/${assetETH}`
    );
    const newBalance = await balanceResponse.json();
    expect(newBalance).toBe(3.5); // 2.0 + 1.5 = 3.5
  });

  test("Should reject deposit for non-existent asset", async ({ request }) => {
    const depositData = {
      asset_id: 9999, // Non-existent asset
      amount: 1.0,
      address: address2,
    };

    const response = await request.post(`${BASE_URL}/create/deposit`, {
      data: depositData,
    });

    expect(response.status()).toBe(404);
    const error = await response.json();
    expect(error.detail).toContain("not found");
  });

  test("Should reject deposit with invalid amount format", async ({
    request,
  }) => {
    const depositData = {
      asset_id: assetETH,
      amount: 0, // Zero amount
      address: address2,
    };

    const response = await request.post(`${BASE_URL}/create/deposit`, {
      data: depositData,
    });

    expect(response.status()).toBe(422);
  });
});

test.afterAll(async () => {
  await pool.end();
  console.log("Database connection closed.");
});
