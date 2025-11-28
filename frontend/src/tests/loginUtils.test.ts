import { consumeRegisterSuccess, parseLoginError } from '../utils/loginUtils';
import { describe, test, expect, vi, beforeEach } from 'vitest';

describe('Login Utils Tests', () => {
  
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  // --- consumeRegisterSuccess ---
  test('TC1: Trả về thông báo nếu có cờ registerSuccess', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('true');
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');

    const result = consumeRegisterSuccess();

    expect(result).toBe('Đăng kí thành công. Vui lòng đăng nhập.');
    expect(removeItemSpy).toHaveBeenCalledWith('registerSuccess');
  });

  test('TC2: Trả về null nếu không có cờ registerSuccess', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    expect(consumeRegisterSuccess()).toBeNull();
  });

  test('TC3: Trả về null nếu xảy ra lỗi (catch block coverage)', () => {
    // Mock getItem để ném lỗi
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Access Denied');
    });

    const result = consumeRegisterSuccess();
    expect(result).toBeNull();
  });

  // --- parseLoginError ---
  test('TC4: Trả về lỗi mặc định nếu err là null/undefined', () => {
    expect(parseLoginError(null)).toBe('Không kết nối được tới server');
    expect(parseLoginError(undefined)).toBe('Không kết nối được tới server');
  });

  test('TC5: Trả về chuỗi nếu err là string', () => {
    expect(parseLoginError('Lỗi mạng')).toBe('Lỗi mạng');
  });

  test('TC6: Dịch lỗi "Unauthorized" sang tiếng Việt', () => {
    expect(parseLoginError({ message: 'Unauthorized' })).toBe('tên đăng nhập hoặc mật khẩu không đúng');
  });

  test('TC7: Trả về err.message nếu có', () => {
    expect(parseLoginError({ message: 'Lỗi hệ thống' })).toBe('Lỗi hệ thống');
  });

  test('TC8: Trả về lỗi mặc định nếu object err không có message', () => {
    expect(parseLoginError({})).toBe('Không kết nối được tới server');
  });
});