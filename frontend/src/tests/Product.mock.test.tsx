import { render, screen, fireEvent, waitFor, configure, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Products from '../pages/Products';
import * as productService from '../services/productService';
import * as authUtils from '../utils/auth'; 
import { vi, describe, test, expect, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

// Cấu hình tìm element theo data-text
configure({ testIdAttribute: 'data-text' });

// 1. Mock Services
vi.mock('../services/productService', () => ({
  getProducts: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

// Mock Auth
vi.mock('../utils/auth', () => ({
  isAuthenticated: vi.fn().mockReturnValue(true),
  getToken: vi.fn(() => 'fake-token'),
}));

// Mock window.confirm
window.confirm = vi.fn(() => true);

const mockedProductService = vi.mocked(productService);
const mockedIsAuthenticated = vi.mocked(authUtils).isAuthenticated;

interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  status: string;
  description?: string; 
}

describe('Products Component - Mock Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    mockedIsAuthenticated.mockReturnValue(true);
    (window.confirm as Mock).mockReturnValue(true);
  });

  // --- TC1: READ (Thành công) ---
  test('TC1: Mock - Lấy danh sách sản phẩm thành công', async () => {
    const mockProducts: Product[] = [
      { id: 'p1', name: 'Laptop X', price: 12000000, stockQuantity: 5, status: 'ACTIVE', description: 'Mô tả A' },
      { id: 'p2', name: 'Mouse', price: 200000, stockQuantity: 50, status: 'ACTIVE', description: '' },
    ];
    mockedProductService.getProducts.mockResolvedValue(mockProducts as any);

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    await screen.findByText('Laptop X');
    expect(screen.getByText('Laptop X')).toBeInTheDocument();
    expect(mockedProductService.getProducts).toHaveBeenCalledTimes(1);
  });

  // --- TC2: READ (Danh sách trống) ---
  test('TC2: Mock - Hiển thị "Không có sản phẩm nào"', async () => {
    mockedProductService.getProducts.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Không có sản phẩm nào')).toBeInTheDocument();
      expect(mockedProductService.getProducts).toHaveBeenCalledTimes(1);
    });
  });

  // --- TC3: CREATE ---
  test('TC3: Mock - Tạo sản phẩm thành công', async () => {
    mockedProductService.getProducts.mockResolvedValue([]); 
    mockedProductService.createProduct.mockResolvedValue({
      id: 'p3',
      name: 'Bàn phím cơ',
      price: 1000,
      stockQuantity: 5,
      status: 'ACTIVE'
    } as any);

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    const openBtn = screen.getByTestId('product-create-button');
    fireEvent.click(openBtn);

    fireEvent.change(screen.getByTestId('product-name-input'), { target: { value: 'Bàn phím cơ' } });
    fireEvent.change(screen.getByTestId('product-price-input'), { target: { value: 1000 } });
    fireEvent.change(screen.getByTestId('product-quantity-input'), { target: { value: 5 } });

    fireEvent.click(screen.getByTestId('product-submit-button'));

    await waitFor(() => {
      expect(mockedProductService.createProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Bàn phím cơ',
          price: 1000
        })
      );
    });
    expect(mockedProductService.getProducts).toHaveBeenCalledTimes(2); 
  });

  // --- TC4: UPDATE ---
  test('TC4: Mock - Cập nhật sản phẩm thành công', async () => {
    // Arrange
    const mockProduct = { 
      id: 'p1', name: 'Laptop Cũ', price: 5000, stockQuantity: 1, status: 'ACTIVE', description: 'Cũ'
    };
    
    mockedProductService.getProducts.mockResolvedValue([mockProduct] as any);
    mockedProductService.updateProduct.mockResolvedValue({ ...mockProduct, name: 'Laptop Mới Vip' } as any);

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    // 1. Click Sửa
    const editButtons = await screen.findAllByTestId('product-edit-button');
    fireEvent.click(editButtons[0]);

    // 2. Nhập liệu (SỬA ID: product-inline-name-input)
    const nameInput = await screen.findByTestId('product-inline-name-input');
    fireEvent.change(nameInput, { target: { value: 'Laptop Mới Vip' } });

    // 3. Click Lưu (SỬA ID: product-inline-save-button)
    const saveBtn = screen.getByTestId('product-inline-save-button');
    fireEvent.click(saveBtn);

    // Assert
    await waitFor(() => {
      expect(mockedProductService.updateProduct).toHaveBeenCalledWith(
        'p1', 
        expect.objectContaining({
          name: 'Laptop Mới Vip'
        })
      );
    });

    expect(mockedProductService.getProducts).toHaveBeenCalledTimes(2);
  });

  // --- TC5: DELETE ---
  test('TC5: Mock - Xóa sản phẩm thành công', async () => {
    const mockProducts: Product[] = [
        { id: 'p1', name: 'Laptop Dell', price: 15000, stockQuantity: 10, status: 'ACTIVE' }
    ];
    mockedProductService.getProducts.mockResolvedValue(mockProducts as any);
    mockedProductService.deleteProduct.mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    const deleteButtons = await screen.findAllByTestId('product-delete-button');
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();

    await waitFor(() => {
        expect(mockedProductService.deleteProduct).toHaveBeenCalledWith('p1');
    });

    expect(mockedProductService.getProducts).toHaveBeenCalledTimes(2);
  });

  // --- TC6: FAILURE ---
  test('TC6: Mock - Hiển thị lỗi khi API chết', async () => {
    mockedProductService.getProducts.mockRejectedValue(new Error('Network Error'));

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    const errorMsg = await screen.findByText(/Không thể tải danh sách sản phẩm/i);
    expect(errorMsg).toBeInTheDocument();
  });

  test('TC7: Mock - Hủy xóa sản phẩm (Click Cancel)', async () => {
    const mockProducts = [{ id: 'p1', name: 'Laptop X', price: 100, stockQuantity: 5, status: 'ACTIVE' }];
    mockedProductService.getProducts.mockResolvedValue(mockProducts as any);
    
    // Mock confirm trả về FALSE (User bấm Hủy)
    (window.confirm as Mock).mockReturnValue(false);

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    const deleteBtn = await screen.findByTestId('product-delete-button');
    fireEvent.click(deleteBtn);
    expect(mockedProductService.deleteProduct).not.toHaveBeenCalled();
  });

  // --- TC8: UPDATE FAILURE (Lỗi API khi Update) ---
  test('TC8: Mock - Hiển thị lỗi khi Cập nhật thất bại', async () => {
    const mockProduct = { id: 'p1', name: 'Laptop X', price: 100, stockQuantity: 5, status: 'ACTIVE' };
    mockedProductService.getProducts.mockResolvedValue([mockProduct] as any);
    // Mock Update thất bại
    mockedProductService.updateProduct.mockRejectedValue(new Error('Update Failed'));

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    // 1. Click Sửa
    const editBtn = await screen.findByTestId('product-edit-button');
    fireEvent.click(editBtn);

    // 2. Click Lưu ngay
    const saveBtn = await screen.findByTestId('product-inline-save-button');
    fireEvent.click(saveBtn);

    // 3. Verify Error Message
    const errorMsg = await screen.findByText(/Không thể cập nhật sản phẩm/i);
    expect(errorMsg).toBeInTheDocument();
  });

  // --- TC9: CREATE VALIDATION (Lỗi local trước khi gọi API) ---
  test('TC9: Mock - Lỗi validation khi tạo sản phẩm (Tên rỗng)', async () => {
    mockedProductService.getProducts.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    // 1. Mở form
    fireEvent.click(screen.getByTestId('product-create-button'));

    // 2. Để trống tên, chỉ nhập giá (Tên bắt buộc)
    fireEvent.change(screen.getByTestId('product-price-input'), { target: { value: 100 } });

    // 3. Submit
    fireEvent.click(screen.getByTestId('product-submit-button'));

    // 4. Verify: API Create KHÔNG được gọi
    expect(mockedProductService.createProduct).not.toHaveBeenCalled();
    
    // 5. Verify: Hiển thị lỗi trên UI
    expect(await screen.findByText(/Tên sản phẩm không được để trống/i)).toBeInTheDocument();
  });

  // --- TC10: SEARCH (Tìm kiếm) ---
  test('TC10: Mock - Tìm kiếm sản phẩm', async () => {
    const mockProducts = [
      { id: 'p1', name: 'Laptop Dell', price: 100, stockQuantity: 5, status: 'ACTIVE' },
      { id: 'p2', name: 'Macbook', price: 200, stockQuantity: 5, status: 'ACTIVE' }
    ];
    mockedProductService.getProducts.mockResolvedValue(mockProducts as any);

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    await screen.findByText('Laptop Dell');

    // Nhập từ khóa tìm kiếm
    const searchInput = screen.getByTestId('product-search-input');
    fireEvent.change(searchInput, { target: { value: 'Dell' } });

    // Kiểm tra: Laptop Dell còn, Macbook mất
    expect(screen.getByText('Laptop Dell')).toBeInTheDocument();
    expect(screen.queryByText('Macbook')).not.toBeInTheDocument();
  });

  // --- TC11: ADD CANCEL (Hủy thêm mới) ---
  test('TC11: Mock - Hủy thêm mới sản phẩm', async () => {
    mockedProductService.getProducts.mockResolvedValue([]);
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    // Mở form
    fireEvent.click(screen.getByTestId('product-create-button'));
    expect(screen.getByTestId('product-name-input')).toBeInTheDocument();

    // Bấm Hủy
    fireEvent.click(screen.getByTestId('product-cancel-button'));

    // Kiểm tra form biến mất
    expect(screen.queryByTestId('product-name-input')).not.toBeInTheDocument();
  });

  // --- TC12: EDIT CANCEL (Hủy sửa) ---
  test('TC12: Mock - Hủy chỉnh sửa sản phẩm', async () => {
    const mockProduct = { id: 'p1', name: 'Laptop X', price: 100, stockQuantity: 5, status: 'ACTIVE' };
    mockedProductService.getProducts.mockResolvedValue([mockProduct] as any);

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    // Bấm Sửa
    const editBtn = await screen.findByTestId('product-edit-button');
    fireEvent.click(editBtn);
    expect(screen.getByTestId('product-inline-save-button')).toBeInTheDocument();

    // Bấm Hủy (Inline)
    const cancelBtn = screen.getByTestId('product-inline-cancel-button');
    fireEvent.click(cancelBtn);

    // Kiểm tra quay lại trạng thái xem
    expect(screen.queryByTestId('product-inline-save-button')).not.toBeInTheDocument();
    expect(screen.getByTestId('product-edit-button')).toBeInTheDocument();
  });

  // --- TC13: CREATE ERROR (API Error) ---
  test('TC13: Mock - Lỗi khi tạo sản phẩm (API Error)', async () => {
    mockedProductService.getProducts.mockResolvedValue([]);
    mockedProductService.createProduct.mockRejectedValue(new Error('Create Failed'));

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId('product-create-button'));
    
    // Điền form hợp lệ
    fireEvent.change(screen.getByTestId('product-name-input'), { target: { value: 'New Product' } });
    fireEvent.change(screen.getByTestId('product-price-input'), { target: { value: 100 } });
    fireEvent.change(screen.getByTestId('product-quantity-input'), { target: { value: 10 } });

    fireEvent.click(screen.getByTestId('product-submit-button'));

    // Kiểm tra lỗi hiển thị
    const errorMsg = await screen.findByText(/Không thể tạo sản phẩm/i);
    expect(errorMsg).toBeInTheDocument();
  });

  // --- TC14: DELETE ERROR (API Error) ---
  test('TC14: Mock - Lỗi khi xóa sản phẩm (API Error)', async () => {
    const mockProduct = { id: 'p1', name: 'Laptop X', price: 100, stockQuantity: 5, status: 'ACTIVE' };
    mockedProductService.getProducts.mockResolvedValue([mockProduct] as any);
    mockedProductService.deleteProduct.mockRejectedValue(new Error('Delete Failed'));

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    const deleteBtn = await screen.findByTestId('product-delete-button');
    fireEvent.click(deleteBtn);

    const errorMsg = await screen.findByText(/Không thể xóa sản phẩm/i);
    expect(errorMsg).toBeInTheDocument();
  });

  // --- TC15: AUTH REDIRECT (Chưa đăng nhập) ---
  test('TC15: Mock - Redirect về Login nếu chưa đăng nhập', async () => {
    mockedIsAuthenticated.mockReturnValue(false); 

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    // Kiểm tra không hiển thị danh sách sản phẩm (do đã redirect hoặc return null)
    expect(screen.queryByText('Danh sách sản phẩm')).not.toBeInTheDocument();
  });
  
  // --- TC16: AUTH CHANGED EVENT (Cover line 61) ---
  test('TC16: Mock - Reload khi có sự kiện authChanged', async () => {
    // 1. Setup điều kiện: Đã đăng nhập
    mockedIsAuthenticated.mockReturnValue(true);
    mockedProductService.getProducts.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    // 2. Kích hoạt sự kiện 'authChanged' (giả lập thay đổi quyền/logout ở tab khác)
    act(() => {
      window.dispatchEvent(new Event('authChanged'));
    });

    // 3. Verify: getProducts được gọi lại 2 lần (1 lần lúc đầu, 1 lần lúc có sự kiện)
    await waitFor(() => {
        expect(mockedProductService.getProducts).toHaveBeenCalledTimes(2);
    });
  });

  // --- TC17: FULL INPUT COVERAGE (Create Form) ---
  test('TC17: Mock - Nhập liệu đầy đủ Form Tạo mới (Cover onChange)', async () => {
    mockedProductService.getProducts.mockResolvedValue([]);
    render(<MemoryRouter><Products /></MemoryRouter>);

    // 1. Mở form
    fireEvent.click(screen.getByTestId('product-create-button'));

    // 2. Nhập Description (Cover dòng 218)
    const descInput = screen.getByPlaceholderText('Nhập mô tả'); // Tìm theo placeholder nếu không có data-text
    fireEvent.change(descInput, { target: { value: 'Mô tả chi tiết sản phẩm' } });

    // 3. Nhập Status (Cover dòng 250)
    const statusInput = screen.getByPlaceholderText('ACTIVE'); // Tìm theo placeholder
    fireEvent.change(statusInput, { target: { value: 'INACTIVE' } });

    // 4. Các trường khác
    fireEvent.change(screen.getByTestId('product-name-input'), { target: { value: 'Test Product' } });
    fireEvent.change(screen.getByTestId('product-price-input'), { target: { value: 100 } });
    fireEvent.change(screen.getByTestId('product-quantity-input'), { target: { value: 10 } });
  });

  // --- TC18: FULL INPUT COVERAGE (Edit Inline Form) ---
  test('TC18: Mock - Nhập liệu đầy đủ Form Sửa (Cover onChange dòng 348-376)', async () => {
    const mockProduct = { id: 'p1', name: 'Old Name', price: 10, stockQuantity: 1, status: 'ACTIVE', description: 'Old Desc' };
    mockedProductService.getProducts.mockResolvedValue([mockProduct] as any);

    render(<MemoryRouter><Products /></MemoryRouter>);

    // 1. Bấm Sửa để hiện form inline
    const editBtns = await screen.findAllByTestId('product-edit-button');
    fireEvent.click(editBtns[0]);

    // 2. Nhập Description (Cover onChange)
    const descInput = screen.getByTestId('product-inline-description-input');
    fireEvent.change(descInput, { target: { value: 'New Description' } });

    // 3. Nhập Price (Cover onChange)
    const priceInput = screen.getByTestId('product-inline-price-input');
    fireEvent.change(priceInput, { target: { value: 999 } });

    // 4. Nhập Quantity (Cover onChange)
    const qtyInput = screen.getByTestId('product-inline-quantity-input');
    fireEvent.change(qtyInput, { target: { value: 99 } });

    // 5. Nhập Status (Cover onChange)
    const statusInput = screen.getByTestId('product-inline-status-input');
    fireEvent.change(statusInput, { target: { value: 'SOLD_OUT' } });
  });
});