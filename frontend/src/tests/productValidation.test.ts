import { validateProduct } from '../utils/productValidation';
import type { Product } from '../utils/productValidation';
import { describe, test, expect } from 'vitest';

describe('Product Validation Tests', () => {

  const validProduct: Product = {
    name: 'Laptop Dell',
    price: 15000000,
    quantity: 10,
    category: 'Electronics',
    description: 'Hàng chính hãng'
  };

  // --- 1. Product Name ---
  test('TC1: Product name rỗng/null/undefined', () => {
    // @ts-ignore
    expect(validateProduct({ ...validProduct, name: null }).name).toBe('Tên sản phẩm không được để trống');
    expect(validateProduct({ ...validProduct, name: '' }).name).toBe('Tên sản phẩm không được để trống');
  });

  test('TC2: Product name quá ngắn (< 3 ký tự)', () => {
    expect(validateProduct({ ...validProduct, name: 'aa' }).name).toBe('Tên sản phẩm phải có ít nhất 3 ký tự');
  });

  test('TC3: Product name quá dài (> 100 ký tự)', () => {
    expect(validateProduct({ ...validProduct, name: 'a'.repeat(101) }).name).toBe('Tên sản phẩm không được vượt quá 100 ký tự');
  });

  // --- 2. Price ---
  test('TC4: Price rỗng/null/undefined', () => {
    // @ts-ignore
    expect(validateProduct({ ...validProduct, price: null }).price).toBe('Giá sản phẩm không được để trống');
    expect(validateProduct({ ...validProduct, price: '' }).price).toBe('Giá sản phẩm không được để trống');
  });

  test('TC5: Price không phải là số (NaN)', () => {
    expect(validateProduct({ ...validProduct, price: 'abc' }).price).toBe('Giá sản phẩm phải là một con số');
  });

  test('TC6: Price <= 0 (Âm hoặc bằng 0)', () => {
    expect(validateProduct({ ...validProduct, price: 0 }).price).toBe('Giá sản phẩm phải lớn hơn 0');
    expect(validateProduct({ ...validProduct, price: -5000 }).price).toBe('Giá sản phẩm phải lớn hơn 0');
  });

  test('TC7: Price quá lớn (> 999,999,999)', () => {
    expect(validateProduct({ ...validProduct, price: 1000000000 }).price).toBe('Giá sản phẩm không được vượt quá 999,999,999');
  });

  // --- 3. Quantity ---
  test('TC8: Quantity rỗng/null/undefined', () => {
    // @ts-ignore
    expect(validateProduct({ ...validProduct, quantity: null }).quantity).toBe('Số lượng không được để trống');
    expect(validateProduct({ ...validProduct, quantity: '' }).quantity).toBe('Số lượng không được để trống');
  });

  test('TC9: Quantity không phải số hoặc số thập phân', () => {
    expect(validateProduct({ ...validProduct, quantity: 'xyz' }).quantity).toBe('Số lượng phải là số nguyên');
    expect(validateProduct({ ...validProduct, quantity: 10.5 }).quantity).toBe('Số lượng phải là số nguyên');
  });

  test('TC10: Quantity âm (< 0)', () => {
    expect(validateProduct({ ...validProduct, quantity: -1 }).quantity).toBe('Số lượng không được âm');
  });

  test('TC11: Quantity quá lớn (> 99,999)', () => {
    expect(validateProduct({ ...validProduct, quantity: 100000 }).quantity).toBe('Số lượng không được vượt quá 99,999');
  });

  // --- 4. Description ---
  test('TC12: Description quá dài (> 500 ký tự)', () => {
    expect(validateProduct({ ...validProduct, description: 'a'.repeat(501) }).description).toBe('Mô tả không được vượt quá 500 ký tự');
  });

  // --- 5. Category ---
  test('TC13: Category rỗng', () => {
    expect(validateProduct({ ...validProduct, category: '' }).category).toBe('Danh mục không được để trống');
  });

  // --- 6. Happy Path ---
  test('TC14: Sản phẩm hợp lệ hoàn toàn', () => {
    const errors = validateProduct(validProduct);
    expect(Object.keys(errors).length).toBe(0);
  });
});