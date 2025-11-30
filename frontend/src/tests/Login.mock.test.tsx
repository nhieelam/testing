import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'; // Import đầy đủ từ vitest
import Login from '../pages/Login'; // Đảm bảo đường dẫn import đúng
import * as authService from '../services/authService';

// 1. Mock authService
vi.mock('../services/authService', () => ({
  login: vi.fn(),
}));

// 2. Mock useNavigate với importActual (Cách của bạn kia - An toàn hơn)
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
  // 3. Setup & Teardown (Kết hợp cho sạch code)
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

  test('TC1: Mock - Đăng nhập thành công', async () => {
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

    // Assert
    await waitFor(() => {
        expect(mockedLoginApi).toHaveBeenCalledWith('testuser','Test1234');
        // Kiểm tra chuyển trang
        expect(mockedNavigate).toHaveBeenCalledWith('/products');
    });
  });

  test('TC2: Mock - Đăng nhập thất bại (sai mật khẩu)', async () => {
    // Arrange
    mockedLoginApi.mockRejectedValue(new Error('Unauthorized')); 

    // Act
    fireEvent.change(screen.getByPlaceholderText(/Tên đăng nhập/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'WrongPass1' } }); // Password sai
    fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

    // Assert
    await waitFor(() => {
        expect(mockedLoginApi).toHaveBeenCalledTimes(1);
        expect(mockedNavigate).not.toHaveBeenCalled();
        expect(screen.getByText(/tên đăng nhập hoặc mật khẩu không đúng/i)).toBeInTheDocument();
    });
  });
});