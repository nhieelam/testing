import { validateUsername, validatePassword } from '../utils/authValidation';

// Test cho Câu 2.1.1 
describe('Login Validation Tests', () => {
  
  //a) Viết unit tests cho validateUsername() 
  describe('validateUsername', () => {
    
    // Test username rỗng
    test('TC1: Username rỗng - nên trả về lỗi', () => {
      expect(validateUsername('')).toBe('Tên đăng nhập không được để trống');
    });

    // Test username quá ngắn/dài 
    test('TC2: Username quá ngắn (2 ký tự) - nên trả về lỗi', () => {
      expect(validateUsername('ab')).toBe('Tên đăng nhập phải có ít nhất 3 ký tự');
    });

    test('TC3: Username quá dài (51 ký tự) - nên trả về lỗi', () => {
      const longUsername = 'a'.repeat(51);
      expect(validateUsername(longUsername)).toBe('Tên đăng nhập không được vượt quá 50 ký tự');
    });

    // Test ký tự đặc biệt không hợp lệ 
    test('TC4: Username có ký tự đặc biệt - nên trả về lỗi', () => {
      expect(validateUsername('user!')).toBe('Tên đăng nhập chỉ được chứa chữ cái và số');
    });

    // Test username hợp lệ 
    test('TC5: Username hợp lệ (user123) - nên trả về chuỗi rỗng (không lỗi)', () => {
      expect(validateUsername('user123')).toBe('');
    });
    
    test('TC6: Username hợp lệ ở biên (3 ký tự) - nên trả về chuỗi rỗng', () => {
      expect(validateUsername('abc')).toBe('');
    });

    test('TC7: Username hợp lệ ở biên (50 ký tự) - nên trả về chuỗi rỗng', () => {
      const validBoundaryUsername = 'a'.repeat(50);
      expect(validateUsername(validBoundaryUsername)).toBe('');
    });
  });

  // Yêu cầu b) Viết unit tests cho validatePassword() 
  describe('validatePassword', () => {
    
    // Test password rỗng 
    test('TC1: Password rỗng - nên trả về lỗi', () => {
      expect(validatePassword('')).toBe('Mật khẩu không được để trống');
    });

    // Test password quá ngắn/dài (Boundary) 
    test('TC2: Password quá ngắn (5 ký tự) - nên trả về lỗi', () => {
      expect(validatePassword('a1234')).toBe('Mật khẩu phải có ít nhất 6 ký tự');
    });

    test('TC3: Password quá dài (101 ký tự) - nên trả về lỗi', () => {
      const longPassword = 'a'.repeat(100) + '1'; // 101 ký tự
      expect(validatePassword(longPassword)).toBe('Mật khẩu không được vượt quá 100 ký tự');
    });

    // Test password không có chữ hoặc số
    test('TC4: Password không có số - nên trả về lỗi', () => {
      expect(validatePassword('password')).toBe('Mật khẩu phải chứa cả chữ và số');
    });

    test('TC5: Password không có chữ - nên trả về lỗi', () => {
      expect(validatePassword('1234567')).toBe('Mật khẩu phải chứa cả chữ và số');
    });

    // Test password hợp lệ
    test('TC6: Password hợp lệ (Test1234) - nên trả về chuỗi rỗng', () => {
      expect(validatePassword('Test1234')).toBe('');
    });

    test('TC7: Password hợp lệ ở biên (6 ký tự) - nên trả về chuỗi rỗng', () => {
      expect(validatePassword('Test12')).toBe('');
    });

    test('TC8: Password hợp lệ ở biên (100 ký tự) - nên trả về chuỗi rỗng', () => {
      const validBoundaryPassword = 'a'.repeat(99) + '1'; // 100 ký tự
      expect(validatePassword(validBoundaryPassword)).toBe('');
    });
  });
});