import http from 'k6/http';

const BASE_URL = 'http://localhost:8080/api';
const CREDENTIALS = {
  username: 'admin10',      
  password: 'admin100',
};

export const options = {
  vus: 1,
  iterations: 1,
};

export default function () {
  const payload = JSON.stringify(CREDENTIALS);

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };

  const res = http.post(`${BASE_URL}/auth/login`, payload, params);

  console.log('STATUS:', res.status);
  console.log('BODY:', res.body);
}
