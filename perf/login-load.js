import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:8080/api';
const USERNAME = 'lam123';
const PASSWORD = 'Password123';

export const options = {
  stages: [
    { duration: '1m', target: 100 },  
    { duration: '2m', target: 100 },

    { duration: '1m', target: 500 }, 
    { duration: '2m', target: 500 },

    { duration: '1m', target: 1000 },  
    { duration: '2m', target: 1000 },

    { duration: '1m', target: 0 },   
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'],  
    http_req_failed: ['rate<0.01'],   
  },
};
export default function () {
  const res = http.post(`${BASE_URL}/auth/login`, {
    username: USERNAME,
    password: PASSWORD,
  });
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
