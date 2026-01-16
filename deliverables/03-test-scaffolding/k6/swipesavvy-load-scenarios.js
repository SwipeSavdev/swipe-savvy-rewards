/**
 * Swipe Savvy Platform - k6 Load Test Scenarios
 *
 * Target: 200 concurrent users, 200 concurrent merchants
 * SLA: p95 < 1500ms, error rate < 1%
 *
 * Usage:
 *   export BASE_URL=http://54.224.8.14:8000
 *   k6 run swipesavvy-load-scenarios.js
 *
 *   # Run specific scenario
 *   k6 run --env SCENARIO=auth_flow swipesavvy-load-scenarios.js
 */

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

// Environment variables
const BASE_URL = __ENV.BASE_URL || "http://54.224.8.14:8000";
const TEST_RUN_ID = __ENV.TEST_RUN_ID || `swipesavvy-${Date.now()}`;
const SCENARIO = __ENV.SCENARIO || "all";

// Custom metrics
const authErrors = new Rate("auth_errors");
const walletErrors = new Rate("wallet_errors");
const rewardsErrors = new Rate("rewards_errors");
const transactionDuration = new Trend("transaction_duration");
const successfulLogins = new Counter("successful_logins");
const successfulTransactions = new Counter("successful_transactions");

// Test configuration
export const options = {
  scenarios: {
    // Scenario 1: User Registration Burst
    user_registration: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 50 },
        { duration: "1m", target: 200 },
        { duration: "30s", target: 200 },
        { duration: "30s", target: 0 },
      ],
      exec: "userRegistration",
      tags: { scenario: "registration" },
    },

    // Scenario 2: Login Storm
    login_storm: {
      executor: "constant-vus",
      vus: 500,
      duration: "30s",
      exec: "loginFlow",
      startTime: "3m",
      tags: { scenario: "login" },
    },

    // Scenario 3: Wallet Operations
    wallet_operations: {
      executor: "ramping-arrival-rate",
      startRate: 10,
      timeUnit: "1s",
      preAllocatedVUs: 200,
      maxVUs: 300,
      stages: [
        { duration: "1m", target: 50 },
        { duration: "2m", target: 100 },
        { duration: "1m", target: 50 },
      ],
      exec: "walletOperations",
      startTime: "4m",
      tags: { scenario: "wallet" },
    },

    // Scenario 4: Rewards Queries
    rewards_queries: {
      executor: "constant-arrival-rate",
      rate: 300,
      timeUnit: "1m",
      duration: "3m",
      preAllocatedVUs: 100,
      maxVUs: 150,
      exec: "rewardsQueries",
      startTime: "7m",
      tags: { scenario: "rewards" },
    },

    // Scenario 5: Mixed Workload (Realistic Traffic)
    mixed_workload: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "2m", target: 100 },
        { duration: "5m", target: 200 },
        { duration: "2m", target: 100 },
        { duration: "1m", target: 0 },
      ],
      exec: "mixedWorkload",
      startTime: "10m",
      tags: { scenario: "mixed" },
    },
  },

  thresholds: {
    http_req_failed: ["rate<0.01"],                    // Error rate < 1%
    http_req_duration: ["p(95)<1500", "p(99)<3000"],   // p95 < 1.5s, p99 < 3s
    "http_req_duration{scenario:login}": ["p(95)<1000"],
    "http_req_duration{scenario:wallet}": ["p(95)<2000"],
    auth_errors: ["rate<0.05"],
    wallet_errors: ["rate<0.02"],
  },
};

// Helper functions
function headers(token = null, idempotencyKey = null) {
  const h = {
    "Content-Type": "application/json",
    "X-Test-Run-Id": TEST_RUN_ID,
    "X-Correlation-Id": `${TEST_RUN_ID}-vu${__VU}-iter${__ITER}`,
  };

  if (token) {
    h["Authorization"] = `Bearer ${token}`;
  }

  if (idempotencyKey) {
    h["Idempotency-Key"] = idempotencyKey;
  }

  return h;
}

function generateEmail() {
  return `test+${TEST_RUN_ID}-vu${__VU}-${Date.now()}@swipesavvy.test`;
}

function generateIdempotencyKey(operation) {
  return `${operation}-${TEST_RUN_ID}-vu${__VU}-${__ITER}-${Date.now()}`;
}

// Store tokens for authenticated requests
const tokens = {};

// ==================== SCENARIO FUNCTIONS ====================

// Scenario 1: User Registration
export function userRegistration() {
  const email = generateEmail();
  const phone = `+1555${String(__VU).padStart(3, "0")}${String(__ITER).padStart(4, "0")}`;

  group("User Registration Flow", function() {
    // Step 1: Request OTP
    const otpRes = http.post(
      `${BASE_URL}/api/v1/auth/request-otp`,
      JSON.stringify({ email, phone }),
      { headers: headers() }
    );

    const otpSuccess = check(otpRes, {
      "OTP request successful": (r) => r.status === 200 || r.status === 201,
      "OTP request < 2s": (r) => r.timings.duration < 2000,
    });

    if (!otpSuccess) {
      authErrors.add(1);
      return;
    }

    authErrors.add(0);
    sleep(1);

    // Step 2: Verify OTP (using test OTP for load testing)
    const verifyRes = http.post(
      `${BASE_URL}/api/v1/auth/verify-otp`,
      JSON.stringify({ email, otp: "123456" }), // Test OTP
      { headers: headers() }
    );

    check(verifyRes, {
      "OTP verification successful": (r) => r.status === 200,
      "Received access token": (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.access_token !== undefined;
        } catch {
          return false;
        }
      },
    });

    if (verifyRes.status === 200) {
      successfulLogins.add(1);
    }
  });

  sleep(Math.random() * 2 + 1);
}

// Scenario 2: Login Flow
export function loginFlow() {
  const email = `loadtest+vu${__VU % 100}@swipesavvy.test`;

  group("Login Flow", function() {
    // Request OTP
    const otpRes = http.post(
      `${BASE_URL}/api/v1/auth/request-otp`,
      JSON.stringify({ email }),
      { headers: headers() }
    );

    check(otpRes, {
      "Login OTP sent": (r) => r.status === 200 || r.status === 201,
    });

    sleep(0.5);

    // Verify OTP
    const verifyRes = http.post(
      `${BASE_URL}/api/v1/auth/verify-otp`,
      JSON.stringify({ email, otp: "123456" }),
      { headers: headers() }
    );

    const loginSuccess = check(verifyRes, {
      "Login successful": (r) => r.status === 200,
    });

    if (loginSuccess && verifyRes.status === 200) {
      try {
        const body = JSON.parse(verifyRes.body);
        tokens[`vu${__VU}`] = body.access_token;
        successfulLogins.add(1);
      } catch (e) {
        authErrors.add(1);
      }
    } else {
      authErrors.add(1);
    }
  });

  sleep(0.2);
}

// Scenario 3: Wallet Operations
export function walletOperations() {
  // Use pre-generated test token or login first
  let token = tokens[`vu${__VU}`];

  if (!token) {
    // Quick login
    const loginRes = http.post(
      `${BASE_URL}/api/v1/auth/verify-otp`,
      JSON.stringify({
        email: `loadtest+wallet${__VU % 50}@swipesavvy.test`,
        otp: "123456"
      }),
      { headers: headers() }
    );

    if (loginRes.status === 200) {
      try {
        token = JSON.parse(loginRes.body).access_token;
        tokens[`vu${__VU}`] = token;
      } catch {
        walletErrors.add(1);
        return;
      }
    } else {
      walletErrors.add(1);
      return;
    }
  }

  group("Wallet Operations", function() {
    // Check balance
    const balanceRes = http.get(
      `${BASE_URL}/api/v1/wallet/balance`,
      { headers: headers(token) }
    );

    check(balanceRes, {
      "Balance check successful": (r) => r.status === 200,
      "Balance response valid": (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.balance !== undefined;
        } catch {
          return false;
        }
      },
    });

    sleep(0.5);

    // Deposit (with idempotency key)
    const depositKey = generateIdempotencyKey("deposit");
    const depositAmount = Math.floor(Math.random() * 100) + 10;

    const depositStart = Date.now();
    const depositRes = http.post(
      `${BASE_URL}/api/v1/wallet/deposit`,
      JSON.stringify({
        amount: depositAmount,
        source: "test_card",
        currency: "USD"
      }),
      { headers: headers(token, depositKey) }
    );
    transactionDuration.add(Date.now() - depositStart);

    const depositSuccess = check(depositRes, {
      "Deposit successful": (r) => r.status === 200 || r.status === 201,
      "Deposit idempotent": (r) => r.status !== 409,
    });

    if (depositSuccess) {
      successfulTransactions.add(1);
      walletErrors.add(0);
    } else {
      walletErrors.add(1);
    }

    sleep(0.5);

    // Get transactions
    const txRes = http.get(
      `${BASE_URL}/api/v1/wallet/transactions?limit=10&offset=0`,
      { headers: headers(token) }
    );

    check(txRes, {
      "Transactions retrieved": (r) => r.status === 200,
      "Transactions paginated": (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body.items) || Array.isArray(body.transactions);
        } catch {
          return false;
        }
      },
    });
  });

  sleep(Math.random() + 0.5);
}

// Scenario 4: Rewards Queries
export function rewardsQueries() {
  let token = tokens[`vu${__VU}`];

  if (!token) {
    const loginRes = http.post(
      `${BASE_URL}/api/v1/auth/verify-otp`,
      JSON.stringify({
        email: `loadtest+rewards${__VU % 100}@swipesavvy.test`,
        otp: "123456"
      }),
      { headers: headers() }
    );

    if (loginRes.status === 200) {
      try {
        token = JSON.parse(loginRes.body).access_token;
        tokens[`vu${__VU}`] = token;
      } catch {
        rewardsErrors.add(1);
        return;
      }
    }
  }

  group("Rewards Queries", function() {
    // Get points balance
    const pointsRes = http.get(
      `${BASE_URL}/api/v1/rewards/points`,
      { headers: headers(token) }
    );

    check(pointsRes, {
      "Points retrieved": (r) => r.status === 200,
    });

    sleep(0.3);

    // Get available boosts
    const boostsRes = http.get(
      `${BASE_URL}/api/v1/rewards/boosts`,
      { headers: headers(token) }
    );

    check(boostsRes, {
      "Boosts retrieved": (r) => r.status === 200,
    });

    sleep(0.3);

    // Get leaderboard
    const leaderboardRes = http.get(
      `${BASE_URL}/api/v1/rewards/leaderboard?limit=10`,
      { headers: headers(token) }
    );

    const leaderboardSuccess = check(leaderboardRes, {
      "Leaderboard retrieved": (r) => r.status === 200,
    });

    if (!leaderboardSuccess) {
      rewardsErrors.add(1);
    } else {
      rewardsErrors.add(0);
    }
  });

  sleep(0.2);
}

// Scenario 5: Mixed Workload (Realistic Traffic Pattern)
export function mixedWorkload() {
  const operations = [
    { weight: 30, fn: () => checkHealth() },
    { weight: 25, fn: () => getBalance() },
    { weight: 20, fn: () => getTransactions() },
    { weight: 15, fn: () => getRewards() },
    { weight: 10, fn: () => makeDeposit() },
  ];

  const rand = Math.random() * 100;
  let cumulative = 0;

  for (const op of operations) {
    cumulative += op.weight;
    if (rand < cumulative) {
      op.fn();
      break;
    }
  }

  sleep(Math.random() * 2 + 0.5);
}

// Helper operations for mixed workload
function checkHealth() {
  const res = http.get(`${BASE_URL}/api/v1/health`, { headers: headers() });
  check(res, { "Health check OK": (r) => r.status === 200 });
}

function getBalance() {
  let token = tokens[`vu${__VU}`];
  if (!token) return;

  const res = http.get(`${BASE_URL}/api/v1/wallet/balance`, { headers: headers(token) });
  check(res, { "Balance OK": (r) => r.status === 200 || r.status === 401 });
}

function getTransactions() {
  let token = tokens[`vu${__VU}`];
  if (!token) return;

  const res = http.get(`${BASE_URL}/api/v1/wallet/transactions?limit=5`, { headers: headers(token) });
  check(res, { "Transactions OK": (r) => r.status === 200 || r.status === 401 });
}

function getRewards() {
  let token = tokens[`vu${__VU}`];
  if (!token) return;

  const res = http.get(`${BASE_URL}/api/v1/rewards/points`, { headers: headers(token) });
  check(res, { "Rewards OK": (r) => r.status === 200 || r.status === 401 });
}

function makeDeposit() {
  let token = tokens[`vu${__VU}`];
  if (!token) return;

  const depositKey = generateIdempotencyKey("deposit");
  const res = http.post(
    `${BASE_URL}/api/v1/wallet/deposit`,
    JSON.stringify({ amount: 25, source: "test", currency: "USD" }),
    { headers: headers(token, depositKey) }
  );
  check(res, { "Deposit OK": (r) => r.status === 200 || r.status === 201 || r.status === 401 });
}

// Setup function
export function setup() {
  console.log(`Starting Swipe Savvy Load Test`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test Run ID: ${TEST_RUN_ID}`);

  // Verify API is reachable
  const healthCheck = http.get(`${BASE_URL}/api/v1/health`);
  if (healthCheck.status !== 200) {
    throw new Error(`API not reachable at ${BASE_URL}`);
  }

  return { startTime: Date.now() };
}

// Teardown function
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`Load test completed in ${duration}s`);
}
