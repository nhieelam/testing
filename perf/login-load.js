import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:8080/api';
const USERNAME = 'lamnhiee';
const PASSWORD = 'Nhi123456';

export const options = {
  vus: 1,
  duration: '1s',
};


export default function () {
  const url = `${BASE_URL}/auth/login`;

  const payload = JSON.stringify({
    username: USERNAME,
    password: PASSWORD,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);

  if (__VU === 1 && __ITER < 3) {
    console.log('Status:', res.status);
    console.log('Body:', res.body);
  }

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
