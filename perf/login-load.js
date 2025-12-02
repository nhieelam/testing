import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:8080/api';

// Lấy số VUs từ biến môi trường USERS, mặc định = 100 nếu không truyền
const USERS = Number(__ENV.USERS) || 100;

const TEST_DURATION = '3m'; // 3 phút

export const options = {
  vus: USERS,
  duration: TEST_DURATION,

  thresholds: {
    // 95% request < 800ms
    http_req_duration: ['p(95)<800'],
    // Tỷ lệ lỗi < 1%
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
