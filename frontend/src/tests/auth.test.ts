import { setAuth, clearAuth, getToken, getUsername, isAuthenticated } from '../utils/auth';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Auth Utils Tests', () => {

  // Khai báo biến mock
  let mockSetItem: any;
  let mockGetItem: any;
  let mockRemoveItem: any;
  let mockDispatchEvent: any;

  // Lưu lại bản gốc để restore sau khi test xong
  const originalSessionStorage = window.sessionStorage;
  const originalDispatchEvent = window.dispatchEvent;

  beforeEach(() => {
    // 1. Reset các hàm mock trước mỗi test
    mockSetItem = vi.fn();
    mockGetItem = vi.fn();
    mockRemoveItem = vi.fn();
    mockDispatchEvent = vi.fn();

    // 2. Thay thế window.sessionStorage bằng object giả
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        setItem: mockSetItem,
        getItem: mockGetItem,
        removeItem: mockRemoveItem,
        clear: vi.fn(),
      },
      writable: true,
    });

    // 3. Mock window.dispatchEvent
    window.dispatchEvent = mockDispatchEvent;
  });

  afterEach(() => {
    // 4. Trả lại hiện trạng gốc cho window sau mỗi test
    Object.defineProperty(window, 'sessionStorage', {
      value: originalSessionStorage,
      writable: true,
    });
    window.dispatchEvent = originalDispatchEvent;
  });

  // --- setAuth ---
  test('TC1: setAuth lưu token và username, dispatch event', () => {
    setAuth('fake-token', 'user1');

    expect(mockSetItem).toHaveBeenCalledWith('token', 'fake-token');
    expect(mockSetItem).toHaveBeenCalledWith('username', 'user1');
    expect(mockSetItem).toHaveBeenCalledWith('isAuthenticated', 'true');
    
    expect(mockDispatchEvent).toHaveBeenCalled();
    // Kiểm tra đúng tên event
    const event = mockDispatchEvent.mock.calls[0][0] as CustomEvent;
    expect(event.type).toBe('authChanged');
  });

  test('TC2: setAuth không lưu username nếu không truyền', () => {
    setAuth('fake-token');

    expect(mockSetItem).toHaveBeenCalledWith('token', 'fake-token');
    // Kiểm tra 'username' KHÔNG được gọi
    expect(mockSetItem).not.toHaveBeenCalledWith('username', expect.anything());
  });

  // --- clearAuth ---
  test('TC3: clearAuth xóa data và dispatch event', () => {
    clearAuth();

    expect(mockRemoveItem).toHaveBeenCalledWith('token');
    expect(mockRemoveItem).toHaveBeenCalledWith('username');
    expect(mockRemoveItem).toHaveBeenCalledWith('isAuthenticated');
    expect(mockDispatchEvent).toHaveBeenCalled();
  });

  // --- Getters ---
  test('TC4: getToken trả về giá trị từ sessionStorage', () => {
    mockGetItem.mockReturnValue('mock-token-val');
    expect(getToken()).toBe('mock-token-val');
  });

  test('TC5: getUsername trả về giá trị từ sessionStorage', () => {
    mockGetItem.mockReturnValue('mock-user');
    expect(getUsername()).toBe('mock-user');
  });

  // --- isAuthenticated ---
  test('TC6: isAuthenticated trả về true khi value là "true"', () => {
    mockGetItem.mockReturnValue('true');
    expect(isAuthenticated()).toBe(true);
  });

  test('TC7: isAuthenticated trả về false khi value khác "true" hoặc null', () => {
    // Trường hợp null
    mockGetItem.mockReturnValue(null);
    expect(isAuthenticated()).toBe(false);
    
    // Trường hợp chuỗi "false"
    mockGetItem.mockReturnValue('false');
    expect(isAuthenticated()).toBe(false);
  });
  
  // --- Exception Handling ---
  test('TC8: setAuth/clearAuth không crash nếu dispatchEvent lỗi', () => {
    // Giả lập dispatchEvent bị lỗi
    mockDispatchEvent.mockImplementation(() => { throw new Error('DOM Error'); });
    
    // Hàm không được ném lỗi ra ngoài (vì đã try-catch)
    expect(() => setAuth('token')).not.toThrow();
    expect(() => clearAuth()).not.toThrow();
  });
});