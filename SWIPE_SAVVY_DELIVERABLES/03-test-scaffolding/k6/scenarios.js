import http from "k6/http";
import { check, sleep } from "k6";
import { randomSeed, randomIntBetween } from "k6";

const BASE_URL = __ENV.BASE_URL;
const TEST_RUN_ID = __ENV.TEST_RUN_ID || `${Date.now()}`;

export const options = {
  scenarios: {
    create_users: { executor: "per-vu-iterations", vus: 200, iterations: 1, maxDuration: "5m" },
    create_merchants: { executor: "per-vu-iterations", vus: 200, iterations: 1, maxDuration: "5m" },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1500"],
  },
};

function headers(idempotencyKey) {
  return {
    "Content-Type": "application/json",
    "X-Test-Run-Id": TEST_RUN_ID,
    "X-Correlation-Id": `${TEST_RUN_ID}-${__VU}-${__ITER}`,
    "Idempotency-Key": idempotencyKey,
  };
}

function uuidLike() {
  return `${TEST_RUN_ID}-${__VU}-${Math.random().toString(16).slice(2)}`;
}

export default function () {
  // This default won't run when scenarios are defined; keep for local quick runs if needed.
}

export function createUser() {
  const email = `test+${TEST_RUN_ID}-user-${__VU}@example.com`;
  const idk = `user-${uuidLike()}`;
  const payload = JSON.stringify({ email, password: "P@ssw0rd123!", profile: { firstName: "Test", lastName: "User" } });
  const res = http.post(`${BASE_URL}/api/users`, payload, { headers: headers(idk) });
  check(res, { "user created": (r) => r.status === 201 || r.status === 200 });
}

export function createMerchant() {
  const name = `Test Merchant ${TEST_RUN_ID}-${__VU}`;
  const idk = `merchant-${uuidLike()}`;
  const payload = JSON.stringify({ name, contactEmail: `test+${TEST_RUN_ID}-merchant-${__VU}@example.com` });
  const res = http.post(`${BASE_URL}/api/merchants`, payload, { headers: headers(idk) });
  check(res, { "merchant created": (r) => r.status === 201 || r.status === 200 });
}

export function setup() {
  randomSeed(1234);
  if (!BASE_URL) throw new Error("Missing BASE_URL");
  return { start: Date.now() };
}
