import http from 'k6/http';
import { check, sleep, group } from 'k6';

// Spike test configuration - sudden traffic surge
export const options = {
  stages: [
    { duration: '30s', target: 50 },      // Baseline: 50 users
    { duration: '10s', target: 500 },     // SPIKE: Jump to 500 users in 10s
    { duration: '2m', target: 500 },      // Maintain spike
    { duration: '30s', target: 50 },      // Return to baseline
    { duration: '30s', target: 0 },       // Cool down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<300', 'p(99)<500'],
    'http_req_failed': ['rate<0.2'],
  },
};

const BASE_URL = 'http://localhost:8000';

export default function () {
  group('Spike Load Test', () => {
    // Simulate rapid API calls during spike
    const res1 = http.get(`${BASE_URL}/api/v1/wallet/balance`);
    check(res1, {
      'balance under spike: status ok': (r) => r.status === 200 || r.status === 401,
      'balance under spike: response < 300ms': (r) => r.timings.duration < 300,
    });

    const res2 = http.get(`${BASE_URL}/api/v1/transactions`);
    check(res2, {
      'transactions under spike: status ok': (r) => r.status === 200 || r.status === 401,
      'transactions under spike: response < 400ms': (r) => r.timings.duration < 400,
    });

    const res3 = http.get(`${BASE_URL}/api/v1/users/profile`);
    check(res3, {
      'profile under spike: status ok': (r) => r.status === 200 || r.status === 401,
      'profile under spike: response < 250ms': (r) => r.timings.duration < 250,
    });

    sleep(0.5);
  });
}
