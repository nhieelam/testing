import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:8080/api';
const USERNAME = 'lam123';
const PASSWORD = 'Password123';

export const options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '30s', target: 300 },
    { duration: '30s', target: 600 },
    { duration: '30s', target: 900 },
    { duration: '30s', target: 1200 },
    { duration: '1m',  target: 0 },
  ],
};

export default function () {
  const res = http.post(`${BASE_URL}/auth/login`, {
    username: USERNAME,
    password: PASSWORD,
  });

  check(res, {
    'status is 200 or 4xx/5xx': (r) => r.status > 0,
  });

  sleep(1);
}
