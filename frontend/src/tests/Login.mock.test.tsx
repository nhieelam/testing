// src/tests/Login.mock.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import * as authService from '../services/authService';
import { vi } from 'vitest';

// MOCK: Mock authService
vi.mock('../services/authService', () => ({
  login: vi.fn(),
}));

// MOCK: Mock useNavigate
const mockedNavigate = vi.fn();

// FIX: Mock react-router-dom
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

const mockedLoginApi = vi.mocked(authService).login;

describe('Login Mock Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  });

  test('TC1: Mock - Login thành công', async () => {
    mockedLoginApi.mockResolvedValue({ 
      token: 'mock-token-123', 
      username: 'testuser',
      userId: 'user-123',
    });

    fireEvent.change(screen.getByPlaceholderText(/Tên đăng nhập/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'Test1234' } });
    fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

    await waitFor(() => {
        expect(mockedLoginApi).toHaveBeenCalledTimes(1);
        expect(mockedNavigate).toHaveBeenCalledWith('/products');
    });
  });

  test('TC2: Mock - Login thất bại (sai mật khẩu)', async () => {
    // SETUP MOCK THẤT BẠI: API reject promise
    mockedLoginApi.mockRejectedValue({ message: 'Unauthorized' }); 

    fireEvent.change(screen.getByPlaceholderText(/Tên đăng nhập/i), { target: { value: 'testuser' } });
    // SỬA LỖI: Cung cấp mật khẩu hợp lệ (WrongPass1) để vượt qua validation cục bộ và gọi API
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'WrongPass1' } }); 
    fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

    // KIỂM TRA: Lỗi hiển thị (từ API mock)
    await waitFor(() => {
        // Kiểm tra API đã được gọi
        expect(mockedLoginApi).toHaveBeenCalledTimes(1); 
        // Tìm element chứa thông báo lỗi API
        const errorMessageContainer = screen.getByText(/tên đăng nhập hoặc mật khẩu không đúng/i).closest('[data-text="login-error"]');
        expect(errorMessageContainer).toBeInTheDocument();
        expect(mockedNavigate).not.toHaveBeenCalled(); 
    });
  });
});