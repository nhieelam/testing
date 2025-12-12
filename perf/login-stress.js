import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:8080/api';

export const options = {
  stages: [
    { duration: '1m', target: 5 },   
    { duration: '1m', target: 50 },  
    { duration: '1m', target: 100 },  
    { duration: '1m', target: 200 },
    { duration: '1m', target: 300 },   
    { duration: '1m', target: 400 }, 
    { duration: '1m', target: 500 },  
    { duration: '1m', target: 600 }, 
    { duration: '1m', target: 800 }, 
    { duration: '1m', target: 1000 }, 
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const payload = JSON.stringify({
    username: 'lamnhiee',
    password: 'Password123',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(`${BASE_URL}/auth/login`, payload, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
