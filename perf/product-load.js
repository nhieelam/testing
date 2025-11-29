import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:8080/api';
const USERNAME = 'lamnhiee';
const PASSWORD = 'Nhi123456';

// options chỉ để có thresholds, vus/duration sẽ override bằng CLI khi chạy load test
export const options = {
  vus: 1,
  duration: '1s',
  thresholds: {
    http_req_duration: ['p(95)<800'],   // target: 95% request < 800ms
    http_req_failed: ['rate<0.01'],     // target: <1% lỗi
  },
};

// Chạy 1 lần trước khi test: login và trả token cho tất cả VU dùng chung
export function setup() {
  const loginUrl = `${BASE_URL}/auth/login`;

  const payload = JSON.stringify({
    username: USERNAME,
    password: PASSWORD,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(loginUrl, payload, params);

  check(res, {
    'login status is 200': (r) => r.status === 200,
  });

  let body;
  try {
    body = JSON.parse(res.body);
  } catch (e) {
    throw new Error(`Cannot parse login response: ${res.body}`);
  }

  if (!body.token) {
    throw new Error(`No token in login response: ${res.body}`);
  }

  return { token: body.token };
}

// Mỗi VU sẽ gọi GET /products với token
export default function (data) {
  const headers = {
    Authorization: `Bearer ${data.token}`,
  };

  const res = http.get(`${BASE_URL}/products`, { headers });

  check(res, {
    'products status is 200': (r) => r.status === 200,
  });

  sleep(1); // giả lập user chờ 1s rồi mới gọi tiếp
}
