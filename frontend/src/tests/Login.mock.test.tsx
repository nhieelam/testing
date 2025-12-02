import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import Login from '../pages/Login';
import * as authService from '../services/authService';

// 1. Mock authService
vi.mock('../services/authService', () => ({
  login: vi.fn(),
}));

// 2. Mock useNavigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

const mockedLoginApi = vi.mocked(authService).login;

describe('Login Component Mock Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- Mock authService ---
  describe('a) Mock authService.loginUser()', () => {
    test('Kiểm tra hàm login đã được Mock (Spy)', () => {
      // Kiểm tra xem hàm login có phải là hàm giả (mock) không
      expect(vi.isMockFunction(mockedLoginApi)).toBe(true);
    });
  });

  // --- Test Success/Failed scenarios ---
  describe('b) Test với mocked successful/failed responses', () => {
    test('TC1: Mock - Đăng nhập thành công (Resolved)', async () => {
      // Arrange
      mockedLoginApi.mockResolvedValue({ 
        token: 'mock-token-123', 
        username: 'testuser',
        userId: 'user-123',
      });

      // Act
      fireEvent.change(screen.getByPlaceholderText(/Tên đăng nhập/i), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'Test1234' } });
      fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

      // Assert UI changes
      await waitFor(() => {
          expect(mockedNavigate).toHaveBeenCalledWith('/products');
      });
    });

    test('TC2: Mock - Đăng nhập thất bại (Rejected)', async () => {
      // Arrange
      mockedLoginApi.mockRejectedValue(new Error('Unauthorized'));

      // Act
      fireEvent.change(screen.getByPlaceholderText(/Tên đăng nhập/i), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'WrongPass1' } });
      fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

      // Assert UI changes
      await waitFor(() => {
          expect(screen.getByText(/tên đăng nhập hoặc mật khẩu không đúng/i)).toBeInTheDocument();
          expect(mockedNavigate).not.toHaveBeenCalled();
      });
    });
  });

  // --- Verify mock calls ---
  describe('c) Verify mock calls', () => {
    test('TC3: Kiểm tra API được gọi đúng tham số (Verify)', async () => {
      // Setup lại kịch bản thành công để check verify
      mockedLoginApi.mockResolvedValue({ token: 'abc', username: 'u', userId: '1' });

      fireEvent.change(screen.getByPlaceholderText(/Tên đăng nhập/i), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'Test1234' } });
      fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

      
      await waitFor(() => {
          // Kiểm tra số lần gọi
          expect(mockedLoginApi).toHaveBeenCalledTimes(1);
          // Kiểm tra tham số truyền vào chính xác
          expect(mockedLoginApi).toHaveBeenCalledWith('testuser', 'Test1234');
      });
    });
  });
});