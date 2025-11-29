import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:8080/api';
const USERNAME = 'lamnhiee';
const PASSWORD = 'Nhi123456';

// 🧪 Stress test: tăng dần số VU để tìm breaking point
export const options = {
  stages: [
    { duration: '30s', target: 50 },   // warm up: 0 -> 50
    { duration: '30s', target: 50 },   // giữ 50

    { duration: '30s', target: 100 },  // tăng lên 100
    { duration: '30s', target: 100 },  // giữ 100

    { duration: '30s', target: 200 },  // tăng lên 200
    { duration: '30s', target: 200 },  // giữ 200

    { duration: '30s', target: 300 },  // tăng lên 300
    { duration: '30s', target: 300 },  // giữ 300

    { duration: '30s', target: 400 },  // tăng lên 400
    { duration: '30s', target: 400 },  // giữ 400

    { duration: '30s', target: 500 },  // tăng lên 500
    { duration: '30s', target: 500 },  // giữ 500

    // Nếu máy/BE chịu được thì có thể thêm 600 / 800 / 1000 nữa
    { duration: '30s', target: 0 },    // cooldown
  ],
  thresholds: {
    // chỉ đặt nhẹ để theo dõi, không cần quá gắt
    http_req_failed: ['rate<0.10'],     // mong muốn < 10% lỗi
    http_req_duration: ['p(95)<2000'], // target 95% request < 2s (chấp nhận stress nên để 2s, không phải 800ms)
  },
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

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  // Trong stress test không nên log quá nhiều, sẽ rất loạn
  // Nếu cần debug thì mở tạm ra vài request đầu:
  // if (__VU === 1 && __ITER < 3) {
  //   console.log('Status:', res.status);
  //   console.log('Body:', res.body);
  // }

  sleep(1);
}
