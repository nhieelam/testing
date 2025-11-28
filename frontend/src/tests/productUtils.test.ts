import { formatPrice, emptyNewProduct, toProductPayload, validateProductPayload } from '../utils/productUtils';
import { describe, test, expect } from 'vitest';

describe('productUtils Tests', () => {
  
  // 1. Test formatPrice
  test('formatPrice: Định dạng đúng tiền Việt Nam', () => {
    const result = formatPrice(15000000);
    expect(result).toContain('15.000.000');
    expect(result).toContain('₫'); // hoặc VND tuỳ locale
  });

  // 2. Test emptyNewProduct
  test('emptyNewProduct: Trả về object mặc định', () => {
    const empty = emptyNewProduct();
    expect(empty).toEqual({
      name: '',
      description: '',
      price: 0,
      stockQuantity: 0,
      status: 'ACTIVE',
    });
  });

  // 3. Test toProductPayload
  test('toProductPayload: Chuyển đổi dữ liệu input thành payload chuẩn', () => {
    const input = {
      name: '  Laptop  ', // Test trim
      price: '1000',     // Test convert string -> number
      stockQuantity: undefined, // Test default 0
      status: null,      // Test default ACTIVE
    };
    
    // @ts-ignore
    const payload = toProductPayload(input);

    expect(payload.name).toBe('Laptop');
    expect(payload.price).toBe(1000);
    expect(payload.stockQuantity).toBe(0);
    expect(payload.status).toBe('ACTIVE');
    expect(payload.description).toBe('');
  });

  // 4. Test validateProductPayload 
  test('validate: Valid payload', () => {
    const valid = validateProductPayload({ name: 'Valid', price: 100, stockQuantity: 10 });
    expect(valid.valid).toBe(true);
  });

  test('validate: Name rỗng', () => {
    expect(validateProductPayload({ name: '' }).valid).toBe(false);
    expect(validateProductPayload({ name: '   ' }).valid).toBe(false);
  });

  test('validate: Price invalid (Cover line 32)', () => {
    // Case NaN
    expect(validateProductPayload({ name: 'A', price: 'abc' as any }).error).toBe('Giá phải là số >= 0');
    // Case Negative
    expect(validateProductPayload({ name: 'A', price: -1 }).error).toBe('Giá phải là số >= 0');
  });

  test('validate: Quantity invalid (Cover line 36/40)', () => {
    // Case NaN
    expect(validateProductPayload({ name: 'A', price: 10, stockQuantity: 'xyz' as any }).error).toBe('Số lượng phải là số >= 0');
    // Case Negative
    expect(validateProductPayload({ name: 'A', price: 10, stockQuantity: -5 }).error).toBe('Số lượng phải là số >= 0');
  });
});