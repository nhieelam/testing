import { validateProduct } from '../utils/productValidation';

// Thêm: Định nghĩa kiểu dữ liệu cho đối tượng product (hoặc DTO)
// Bạn nên điều chỉnh cái này cho khớp với định nghĩa thực tế của bạn
interface ProductInput {
  name: string;
  price: number;
  quantity: number;
  category: string;
  description: string;
  // Thêm các trường khác nếu có
}

// Test cho Câu 2.2.1 
describe('Product Validation Tests', () => {

  // Dữ liệu mẫu hợp lệ
  const validProduct: ProductInput = {
    name: 'Laptop Dell',
    price: 15000000,
    quantity: 10,
    category: 'Electronics',
    description: 'Hàng chính hãng'
  };

  // Yêu cầu a) Viết unit tests cho validateProduct()
  
  // Test product name validation 
  test('TC1: Product name rỗng - nên trả về lỗi', () => {
    const product: ProductInput = { ...validProduct, name: '' };
    const errors = validateProduct(product);
    expect(errors.name).toBe('Tên sản phẩm không được để trống');
  });

  test('TC2: Product name quá ngắn (2 ký tự) - nên trả về lỗi', () => {
    const product: ProductInput = { ...validProduct, name: 'aa' };
    const errors = validateProduct(product);
    expect(errors.name).toBe('Tên sản phẩm phải có ít nhất 3 ký tự');
  });

  test('TC3: Product name quá dài (101 ký tự) - nên trả về lỗi', () => {
    const product: ProductInput = { ...validProduct, name: 'a'.repeat(101) };
    const errors = validateProduct(product);
    expect(errors.name).toBe('Tên sản phẩm không được vượt quá 100 ký tự');
  });

  // Test price validation (boundary tests)
  test('TC4: Price bằng 0 - nên trả về lỗi', () => {
    const product: ProductInput = { ...validProduct, price: 0 };
    const errors = validateProduct(product);
    expect(errors.price).toBe('Giá sản phẩm phải lớn hơn 0');
  });

  test('TC5: Price âm - nên trả về lỗi', () => {
    const product: ProductInput = { ...validProduct, price: -1000 };
    const errors = validateProduct(product);
    expect(errors.price).toBe('Giá sản phẩm phải lớn hơn 0');
  });

  test('TC6: Price quá lớn (Boundary) - nên trả về lỗi', () => {
    const product: ProductInput = { ...validProduct, price: 1000000000 }; // 1 tỷ
    const errors = validateProduct(product);
    expect(errors.price).toBe('Giá sản phẩm không được vượt quá 999,999,999');
  });

  // Test quantity validation 
  test('TC7: Quantity âm (Boundary) - nên trả về lỗi', () => {
    const product: ProductInput = { ...validProduct, quantity: -1 };
    const errors = validateProduct(product);
    expect(errors.quantity).toBe('Số lượng không được âm');
  });

  test('TC8: Quantity quá lớn (Boundary) - nên trả về lỗi', () => {
    const product: ProductInput = { ...validProduct, quantity: 100000 }; // 100,000
    const errors = validateProduct(product);
    expect(errors.quantity).toBe('Số lượng không được vượt quá 99,999');
  });

  test('TC9: Quantity là số thập phân - nên trả về lỗi', () => {
    const product: ProductInput = { ...validProduct, quantity: 10.5 };
    const errors = validateProduct(product);
    expect(errors.quantity).toBe('Số lượng phải là số nguyên');
  });

  // Test description length
  test('TC10: Description quá dài (501 ký tự) - nên trả về lỗi', () => {
    const product: ProductInput = { ...validProduct, description: 'a'.repeat(501) };
    const errors = validateProduct(product);
    expect(errors.description).toBe('Mô tả không được vượt quá 500 ký tự');
  });

  // Test category validation 
  test('TC11: Category rỗng - nên trả về lỗi', () => {
    const product: ProductInput = { ...validProduct, category: '' };
    const errors = validateProduct(product);
    expect(errors.category).toBe('Danh mục không được để trống');
  });

  // Test sản phẩm hợp lệ
  test('TC12: Product hợp lệ - không có lỗi trả về', () => {
    const errors = validateProduct(validProduct);
    expect(Object.keys(errors).length).toBe(0);
  });
});