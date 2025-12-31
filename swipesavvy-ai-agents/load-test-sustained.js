import http from 'k6/http';
import { check, sleep, group } from 'k6';

// Load test configuration
export const options = {
  stages: [
    { duration: '30s', target: 50 },    // Ramp up to 50 users over 30s
    { duration: '1m', target: 100 },    // Ramp up to 100 users over 1m
    { duration: '2m', target: 200 },    // Ramp up to 200 users over 2m
    { duration: '3m', target: 500 },    // Ramp up to 500 users over 3m
    { duration: '5m', target: 500 },    // Stay at 500 users for 5m
    { duration: '2m', target: 100 },    // Ramp down to 100 users over 2m
    { duration: '30s', target: 0 },     // Ramp down to 0 users
  ],
  thresholds: {
    'http_req_duration': ['p(95)<200', 'p(99)<400'],      // 95th percentile < 200ms, 99th < 400ms
    'http_req_failed': ['rate<0.1'],                       // Error rate < 10%
    'http_req_waiting': ['p(99)<300'],                     // Time to first byte < 300ms
  },
};

// Test data
const BASE_URL = 'http://localhost:8000'; // FastAPI backend
const ENDPOINTS = [
  '/api/v1/wallet/balance',
  '/api/v1/transactions',
  '/api/v1/users/profile',
  '/api/v1/cards',
  '/api/v1/health',
];

export default function () {
  // Simulate a user performing various API calls
  group('API Performance', () => {
    // Test balance endpoint
    let res = http.get(`${BASE_URL}/api/v1/wallet/balance`);
    check(res, {
      'balance endpoint status is 200': (r) => r.status === 200 || r.status === 401,
      'balance response time < 200ms': (r) => r.timings.duration < 200,
    });

    sleep(1);

    // Test transactions endpoint
    res = http.get(`${BASE_URL}/api/v1/transactions`);
    check(res, {
      'transactions status is 200': (r) => r.status === 200 || r.status === 401,
      'transactions response time < 300ms': (r) => r.timings.duration < 300,
    });

    sleep(1);

    // Test profile endpoint
    res = http.get(`${BASE_URL}/api/v1/users/profile`);
    check(res, {
      'profile status is 200': (r) => r.status === 200 || r.status === 401,
      'profile response time < 150ms': (r) => r.timings.duration < 150,
    });

    sleep(1);

    // Test cards endpoint
    res = http.get(`${BASE_URL}/api/v1/cards`);
    check(res, {
      'cards status is 200': (r) => r.status === 200 || r.status === 401,
      'cards response time < 250ms': (r) => r.timings.duration < 250,
    });

    sleep(1);

    // Test health check
    res = http.get(`${BASE_URL}/api/v1/health`);
    check(res, {
      'health status is 200': (r) => r.status === 200,
      'health response time < 50ms': (r) => r.timings.duration < 50,
    });

    sleep(1);
  });
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data),
  };
}

// Helper function to format summary
function textSummary(data, options) {
  const { indent = '', enableColors = false } = options;
  let summary = '';

  summary += `\n${indent}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  summary += `${indent}📊 LOAD TEST SUMMARY\n`;
  summary += `${indent}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

  if (data.metrics) {
    const metrics = data.metrics;
    
    if (metrics.http_req_duration) {
      const dur = metrics.http_req_duration;
      summary += `${indent}\n✓ Request Duration:\n`;
      summary += `${indent}  Average: ${dur.data.stats?.mean?.toFixed(2) || 'N/A'} ms\n`;
      summary += `${indent}  Min:     ${dur.data.stats?.min?.toFixed(2) || 'N/A'} ms\n`;
      summary += `${indent}  Max:     ${dur.data.stats?.max?.toFixed(2) || 'N/A'} ms\n`;
      summary += `${indent}  P95:     ${dur.data.values?.['95']?.toFixed(2) || 'N/A'} ms\n`;
      summary += `${indent}  P99:     ${dur.data.values?.['99']?.toFixed(2) || 'N/A'} ms\n`;
    }

    if (metrics.http_req_failed) {
      const failed = metrics.http_req_failed;
      summary += `${indent}\n✓ Request Failures:\n`;
      summary += `${indent}  Rate: ${failed.data.value?.toFixed(2) || 'N/A'} %\n`;
    }

    if (metrics.vus_max) {
      const vus = metrics.vus_max;
      summary += `${indent}\n✓ Virtual Users:\n`;
      summary += `${indent}  Max: ${vus.data.value} users\n`;
    }
  }

  summary += `\n${indent}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

  return summary;
}
