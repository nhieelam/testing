import { validateLoginForm } from '../utils/loginValidation';
import { describe, test, expect } from 'vitest';

describe('validateLoginForm Tests', () => {

  // --- Validate Username ---
  test('TC1: Username rỗng - Trả về lỗi', () => {
    const result = validateLoginForm('', 'Pass123');
    expect(result.usernameError).toBe('Tên đăng nhập không được để trống');
  });

  test('TC2: Username chứa ký tự đặc biệt - Trả về lỗi', () => {
    const result = validateLoginForm('user@name', 'Pass123');
    expect(result.usernameError).toBe('tên đăng nhập không hợp lệ');
  });

  test('TC3: Username có khoảng trắng - Trả về lỗi', () => {
    const result = validateLoginForm('user name', 'Pass123');
    expect(result.usernameError).toBe('tên đăng nhập không hợp lệ');
  });

  test('TC4: Username hợp lệ - Không có lỗi', () => {
    const result = validateLoginForm('valid_user_123', 'Pass123');
    expect(result.usernameError).toBeNull();
  });

  // --- Validate Password ---
  test('TC5: Password rỗng - Trả về lỗi', () => {
    const result = validateLoginForm('user123', '');
    expect(result.passwordError).toBe('Mật khẩu là bắt buộc');
  });

  test('TC6: Password quá ngắn (< 6 ký tự) - Trả về lỗi', () => {
    const result = validateLoginForm('user123', '12345');
    expect(result.passwordError).toBe('Mật khẩu phải từ 6 đến 100 ký tự');
  });

  test('TC7: Password quá dài (> 100 ký tự) - Trả về lỗi', () => {
    const longPass = 'a'.repeat(101);
    const result = validateLoginForm('user123', longPass);
    expect(result.passwordError).toBe('Mật khẩu phải từ 6 đến 100 ký tự');
  });

  test('TC8: Password chỉ có chữ (thiếu số) - Trả về lỗi', () => {
    const result = validateLoginForm('user123', 'abcdefgh');
    expect(result.passwordError).toBe('Mật khẩu phải chứa cả chữ và số');
  });

  test('TC9: Password chỉ có số (thiếu chữ) - Trả về lỗi', () => {
    const result = validateLoginForm('user123', '12345678');
    expect(result.passwordError).toBe('Mật khẩu phải chứa cả chữ và số');
  });

  test('TC10: Password hợp lệ (đủ chữ, số, độ dài) - Không có lỗi', () => {
    const result = validateLoginForm('user123', 'Test1234');
    expect(result.passwordError).toBeNull();
  });

  // --- Trim check ---
  test('TC11: Input có khoảng trắng thừa ở đầu cuối - Tự động trim', () => {
    const result = validateLoginForm('  user123  ', '  Test1234  ');
    expect(result.usernameError).toBeNull();
    expect(result.passwordError).toBeNull();
  });
});