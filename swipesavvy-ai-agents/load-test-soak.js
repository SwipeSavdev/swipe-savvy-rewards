import http from 'k6/http';
import { check, sleep, group } from 'k6';

// Soak test configuration - long duration at moderate load
export const options = {
  stages: [
    { duration: '5m', target: 100 },      // Ramp up to 100 users over 5m
    { duration: '30m', target: 100 },     // Soak: Stay at 100 users for 30m
    { duration: '5m', target: 0 },        // Ramp down over 5m
  ],
  thresholds: {
    'http_req_duration': ['p(95)<200', 'p(99)<400'],
    'http_req_failed': ['rate<0.1'],
  },
};

const BASE_URL = 'http://localhost:8000';

export default function () {
  group('Soak Test - Long Duration', () => {
    // Simulate typical user behavior over extended period
    const res1 = http.get(`${BASE_URL}/api/v1/wallet/balance`);
    check(res1, {
      'soak: balance status ok': (r) => r.status === 200 || r.status === 401,
      'soak: balance consistent response time': (r) => r.timings.duration < 200,
    });

    sleep(2);

    const res2 = http.get(`${BASE_URL}/api/v1/transactions`);
    check(res2, {
      'soak: transactions status ok': (r) => r.status === 200 || r.status === 401,
      'soak: transactions consistent response time': (r) => r.timings.duration < 300,
    });

    sleep(2);

    const res3 = http.get(`${BASE_URL}/api/v1/users/profile`);
    check(res3, {
      'soak: profile status ok': (r) => r.status === 200 || r.status === 401,
      'soak: profile consistent response time': (r) => r.timings.duration < 150,
    });

    sleep(2);

    const res4 = http.get(`${BASE_URL}/api/v1/cards`);
    check(res4, {
      'soak: cards status ok': (r) => r.status === 200 || r.status === 401,
      'soak: cards consistent response time': (r) => r.timings.duration < 250,
    });

    sleep(2);
  });
}
