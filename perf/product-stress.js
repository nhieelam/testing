import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:8080/api'; // or your backend
const USERNAME = 'lam123';
const PASSWORD = 'Password123';
