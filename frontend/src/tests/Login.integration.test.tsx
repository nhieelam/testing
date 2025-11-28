import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import * as authService from '../services/authService';
import { vi } from 'vitest';

// MOCK: Mock authService để tránh lỗi API thực
vi.mock('../services/authService', () => ({
  login: vi.fn(),
}));

describe('Login Component Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Bọc component Login trong MemoryRouter
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  });

  test('TC1: Hiển thị form login đầy đủ', () => {
    expect(screen.getByPlaceholderText(/Tên đăng nhập/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /đăng nhập/i })).toBeInTheDocument();
  });

  test('TC2: Hiển thị lỗi khi submit form rỗng', async () => {
    fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

   // SỬA: Dùng getByText và waitFor để đảm bảo lỗi validation đã hiển thị (khắc phục lỗi tìm kiếm data-text/testid)
   await waitFor(() => {
        const usernameError = screen.getByText('Tên đăng nhập không được để trống');
        const passwordError = screen.getByText('Mật khẩu là bắt buộc');

        expect(usernameError).toBeInTheDocument();
        expect(passwordError).toBeInTheDocument();
    }, { timeout: 1500 });
  });

  test('TC3: Gọi API khi submit form hợp lệ', async () => {
    // SỬA LỖI Type Checking (TS2345): Thêm thuộc tính userId
    vi.mocked(authService).login.mockResolvedValue({ 
        token: 'mock', 
        username: 'test', 
        userId: 'user-123' 
    });

    const usernameInput = screen.getByPlaceholderText(/Tên đăng nhập/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitBtn = screen.getByRole('button', { name: /đăng nhập/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'Test1234' } });
    fireEvent.click(submitBtn);

    // Kiểm tra API call đã được thực hiện
    await waitFor(() => {
      expect(vi.mocked(authService).login).toHaveBeenCalledWith('testuser', 'Test1234');
    });
  });
});