/**
 * Swipe Savvy Platform - E2E Sync Helpers
 *
 * Utilities for testing data synchronization across apps
 * (Mobile ↔ Web ↔ Admin)
 */

import { Page, APIRequestContext } from "@playwright/test";

const API_URL = process.env.API_URL || "http://54.224.8.14:8000";

/**
 * Wait for a condition to be met by polling
 */
export async function waitForSync(opts: {
  fetchFn: () => Promise<{ ok: boolean; payload?: any }>;
  timeoutMs?: number;
  intervalMs?: number;
}) {
  const timeoutMs = opts.timeoutMs ?? 60_000;
  const intervalMs = opts.intervalMs ?? 1_000;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const res = await opts.fetchFn();
    if (res.ok) return res.payload;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Sync not completed within ${timeoutMs}ms`);
}

/**
 * Wait for wallet balance to update after a transaction
 */
export async function waitForBalanceUpdate(
  request: APIRequestContext,
  token: string,
  expectedBalance: number,
  tolerance: number = 0.01
): Promise<number> {
  return waitForSync({
    fetchFn: async () => {
      const response = await request.get(`${API_URL}/api/v1/wallet/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status() !== 200) {
        return { ok: false };
      }

      const body = await response.json();
      const balance = body.balance || body.available_balance || 0;

      if (Math.abs(balance - expectedBalance) <= tolerance) {
        return { ok: true, payload: balance };
      }

      return { ok: false };
    },
    timeoutMs: 30_000,
    intervalMs: 500,
  });
}

/**
 * Wait for transaction to appear in history
 */
export async function waitForTransaction(
  request: APIRequestContext,
  token: string,
  idempotencyKey: string
): Promise<any> {
  return waitForSync({
    fetchFn: async () => {
      const response = await request.get(`${API_URL}/api/v1/wallet/transactions?limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status() !== 200) {
        return { ok: false };
      }

      const body = await response.json();
      const transactions = body.items || body.transactions || [];

      const found = transactions.find(
        (tx: any) => tx.idempotency_key === idempotencyKey
      );

      if (found) {
        return { ok: true, payload: found };
      }

      return { ok: false };
    },
    timeoutMs: 30_000,
    intervalMs: 1000,
  });
}

/**
 * Wait for user status to update in admin view
 */
export async function waitForUserStatusUpdate(
  request: APIRequestContext,
  adminToken: string,
  userId: string,
  expectedStatus: string
): Promise<any> {
  return waitForSync({
    fetchFn: async () => {
      const response = await request.get(`${API_URL}/api/v1/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (response.status() !== 200) {
        return { ok: false };
      }

      const body = await response.json();

      if (body.status === expectedStatus || body.kyc_status === expectedStatus) {
        return { ok: true, payload: body };
      }

      return { ok: false };
    },
    timeoutMs: 30_000,
    intervalMs: 1000,
  });
}

/**
 * Wait for rewards points to update
 */
export async function waitForPointsUpdate(
  request: APIRequestContext,
  token: string,
  minPoints: number
): Promise<number> {
  return waitForSync({
    fetchFn: async () => {
      const response = await request.get(`${API_URL}/api/v1/rewards/points`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status() !== 200) {
        return { ok: false };
      }

      const body = await response.json();
      const points = body.points || body.balance || 0;

      if (points >= minPoints) {
        return { ok: true, payload: points };
      }

      return { ok: false };
    },
    timeoutMs: 30_000,
    intervalMs: 1000,
  });
}

/**
 * Get auth token via API (for test setup)
 */
export async function getAuthToken(
  request: APIRequestContext,
  email: string,
  otp: string = "123456"
): Promise<string> {
  // Request OTP
  await request.post(`${API_URL}/api/v1/auth/request-otp`, {
    data: { email },
  });

  // Verify OTP
  const verifyResponse = await request.post(`${API_URL}/api/v1/auth/verify-otp`, {
    data: { email, otp },
  });

  if (verifyResponse.status() !== 200) {
    throw new Error(`Failed to authenticate: ${verifyResponse.status()}`);
  }

  const body = await verifyResponse.json();
  return body.access_token;
}

/**
 * Create a test user via API
 */
export async function createTestUser(
  request: APIRequestContext,
  email: string
): Promise<{ email: string; token: string }> {
  // In test environment, OTP verification creates user if not exists
  const token = await getAuthToken(request, email);
  return { email, token };
}

/**
 * Assert data is synced between wallet web and admin portal
 */
export async function assertCrossAppSync(
  request: APIRequestContext,
  userToken: string,
  adminToken: string,
  userId: string
): Promise<{ walletBalance: number; adminViewBalance: number; synced: boolean }> {
  // Get balance from wallet API
  const walletResponse = await request.get(`${API_URL}/api/v1/wallet/balance`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  const walletData = await walletResponse.json();
  const walletBalance = walletData.balance || 0;

  // Get user details from admin API
  const adminResponse = await request.get(`${API_URL}/api/v1/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminData = await adminResponse.json();
  const adminViewBalance = adminData.wallet_balance || adminData.balance || 0;

  const synced = Math.abs(walletBalance - adminViewBalance) < 0.01;

  return { walletBalance, adminViewBalance, synced };
}

/**
 * Generate test correlation headers
 */
export function getTestHeaders(testRunId?: string) {
  const runId = testRunId || `playwright-${Date.now()}`;
  return {
    "X-Test-Run-Id": runId,
    "X-Correlation-Id": `${runId}-${Math.random().toString(36).substring(7)}`,
  };
}

/**
 * Generate idempotency key for transactions
 */
export function generateIdempotencyKey(operation: string): string {
  return `${operation}-playwright-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}
