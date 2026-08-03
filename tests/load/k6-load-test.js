import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  // Simulate 100 concurrent users for 30 seconds
  stages: [
    { duration: '10s', target: 50 }, // Ramp up to 50 users
    { duration: '10s', target: 100 }, // Ramp up to 100 users
    { duration: '10s', target: 0 },  // Scale down
  ],
  thresholds: {
    // 95% of requests must complete below 500ms
    http_req_duration: ['p(95)<500'],
    // Less than 1% of requests should fail
    http_req_failed: ['rate<0.01'],
  },
};

const API_BASE = 'http://localhost:8080/api';

export default function () {
  // 1. Authenticate to get a JWT token
  const loginPayload = JSON.stringify({
    employeeId: 'EMP043',
    password: 'sacl@123',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const loginRes = http.post(`${API_BASE}/auth/login`, loginPayload, params);
  
  check(loginRes, {
    'login is status 200': (r) => r.status === 200,
    'has token': (r) => r.json('token') !== undefined,
  });

  const token = loginRes.json('token');

  if (token) {
    // 2. Stress test the QC Register fetch endpoint with the token
    const authParams = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };

    const fetchRes = http.get(`${API_BASE}/qc-register`, authParams);
    check(fetchRes, {
      'fetch qc records is status 200': (r) => r.status === 200,
    });
  }

  // Sleep to simulate user think time
  sleep(1);
}
