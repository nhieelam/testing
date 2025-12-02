import { render, screen, fireEvent, waitFor, configure, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Products from '../pages/Products';
import * as productService from '../services/productService';
import * as authUtils from '../utils/auth'; 
import { vi, describe, test, expect, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

configure({ testIdAttribute: 'data-text' });

// 1. Mock Services & Auth
vi.mock('../services/productService', () => ({
  getProducts: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

vi.mock('../utils/auth', () => ({
  isAuthenticated: vi.fn().mockReturnValue(true),
  getToken: vi.fn(() => 'fake-token'),
}));

window.confirm = vi.fn(() => true);

const mockedProductService = vi.mocked(productService);
const mockedIsAuthenticated = vi.mocked(authUtils).isAuthenticated;

describe('Products Component - Mock Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    mockedIsAuthenticated.mockReturnValue(true);
    (window.confirm as Mock).mockReturnValue(true);
  });

  // ==========================================
  //            MOCK CRUD OPERATIONS
  // ==========================================
  describe('a) Mock CRUD operations', () => {
    test('TC1: Read - Lấy danh sách sản phẩm thành công', async () => {
      const mockProducts = [{ id: 'p1', name: 'Laptop X', price: 12000000, stockQuantity: 5, status: 'ACTIVE', description: 'Mô tả A' },
        { id: 'p2', name: 'Mouse', price: 200000, stockQuantity: 50, status: 'ACTIVE', description: '' },
      ];
      mockedProductService.getProducts.mockResolvedValue(mockProducts as any);
      render(<MemoryRouter><Products /></MemoryRouter>);
      await screen.findByText('Laptop X');
      expect(screen.getByText('Laptop X')).toBeInTheDocument();
      expect(mockedProductService.getProducts).toHaveBeenCalledTimes(1);
    });

    test('TC3: Create - Tạo sản phẩm thành công', async () => {
      mockedProductService.getProducts.mockResolvedValue([]); 
      mockedProductService.createProduct.mockResolvedValue({ id: 'p3', name: 'Bàn phím cơ', price: 1000, stockQuantity: 5, status: 'ACTIVE' } as any);
      render(<MemoryRouter><Products /></MemoryRouter>);
      fireEvent.click(screen.getByTestId('product-create-button'));
      fireEvent.change(screen.getByTestId('product-name-input'), { target: { value: 'Bàn phím cơ' } });
      fireEvent.change(screen.getByTestId('product-price-input'), { target: { value: 1000 } });
      fireEvent.change(screen.getByTestId('product-quantity-input'), { target: { value: 5 } });
      fireEvent.click(screen.getByTestId('product-submit-button'));
      await waitFor(() => expect(mockedProductService.createProduct).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Bàn phím cơ', price: 1000 })
      ));
      expect(mockedProductService.getProducts).toHaveBeenCalledTimes(2); 
    });

    test('TC4: Update - Cập nhật sản phẩm thành công', async () => {
      const mockProduct = { id: 'p1', name: 'Laptop Cũ', price: 5000, stockQuantity: 1, status: 'ACTIVE', description: 'Cũ' };
      mockedProductService.getProducts.mockResolvedValue([mockProduct] as any);
      mockedProductService.updateProduct.mockResolvedValue({ ...mockProduct, name: 'Laptop Mới Vip' } as any);
      render(<MemoryRouter><Products /></MemoryRouter>);
      const editButtons = await screen.findAllByTestId('product-edit-button');
      fireEvent.click(editButtons[0]);
      const nameInput = await screen.findByTestId('product-inline-name-input');
      fireEvent.change(nameInput, { target: { value: 'Laptop Mới Vip' } });
      const saveBtn = screen.getByTestId('product-inline-save-button');
      fireEvent.click(saveBtn);
      await waitFor(() => expect(mockedProductService.updateProduct).toHaveBeenCalledWith(
        'p1', expect.objectContaining({ name: 'Laptop Mới Vip' })
      ));
      expect(mockedProductService.getProducts).toHaveBeenCalledTimes(2);
    });

    test('TC5: Delete - Xóa sản phẩm thành công', async () => {
      const mockProducts = [{ id: 'p1', name: 'Laptop Dell', price: 15000, stockQuantity: 10, status: 'ACTIVE' }];
      mockedProductService.getProducts.mockResolvedValue(mockProducts as any);
      mockedProductService.deleteProduct.mockResolvedValue(undefined);
      render(<MemoryRouter><Products /></MemoryRouter>);
      const deleteButtons = await screen.findAllByTestId('product-delete-button');
      fireEvent.click(deleteButtons[0]);
      expect(window.confirm).toHaveBeenCalled();
      await waitFor(() => expect(mockedProductService.deleteProduct).toHaveBeenCalledWith('p1'));
      expect(mockedProductService.getProducts).toHaveBeenCalledTimes(2);
    });
  });

  // ==========================================
  //      TEST SUCCESS & FAILURE SCENARIOS
  // ==========================================
  describe('b) Test success and failure scenarios', () => {
    test('TC2: Success - Hiển thị "Không có sản phẩm nào" (Empty List)', async () => {
      mockedProductService.getProducts.mockResolvedValue([]);
      render(<MemoryRouter><Products /></MemoryRouter>);
      await waitFor(() => {
        expect(screen.getByText('Không có sản phẩm nào')).toBeInTheDocument();
        expect(mockedProductService.getProducts).toHaveBeenCalledTimes(1);
      });
    });

    test('TC6: Failure - Hiển thị lỗi khi API chết (Load Error)', async () => {
      mockedProductService.getProducts.mockRejectedValue(new Error('Network Error'));
      render(<MemoryRouter><Products /></MemoryRouter>);
      const errorMsg = await screen.findByText(/Không thể tải danh sách sản phẩm/i);
      expect(errorMsg).toBeInTheDocument();
    });

    test('TC8: Failure - Hiển thị lỗi khi Cập nhật thất bại (Update Error)', async () => {
      const mockProduct = { id: 'p1', name: 'Laptop X', price: 100, stockQuantity: 5, status: 'ACTIVE' };
      mockedProductService.getProducts.mockResolvedValue([mockProduct] as any);
      mockedProductService.updateProduct.mockRejectedValue(new Error('Update Failed'));
      render(<MemoryRouter><Products /></MemoryRouter>);
      const editBtn = await screen.findByTestId('product-edit-button');
      fireEvent.click(editBtn);
      const saveBtn = await screen.findByTestId('product-inline-save-button');
      fireEvent.click(saveBtn);
      const errorMsg = await screen.findByText(/Không thể cập nhật sản phẩm/i);
      expect(errorMsg).toBeInTheDocument();
    });

    test('TC9: Validation - Lỗi validation khi tạo sản phẩm (Tên rỗng)', async () => {
      mockedProductService.getProducts.mockResolvedValue([]);
      render(<MemoryRouter><Products /></MemoryRouter>);
      fireEvent.click(screen.getByTestId('product-create-button'));
      fireEvent.change(screen.getByTestId('product-price-input'), { target: { value: 100 } });
      fireEvent.click(screen.getByTestId('product-submit-button'));
      expect(mockedProductService.createProduct).not.toHaveBeenCalled();
      expect(await screen.findByText(/Tên sản phẩm không được để trống/i)).toBeInTheDocument();
    });

    test('TC13: Failure - Lỗi khi tạo sản phẩm (Create Error)', async () => {
      mockedProductService.getProducts.mockResolvedValue([]);
      mockedProductService.createProduct.mockRejectedValue(new Error('Create Failed'));
      render(<MemoryRouter><Products /></MemoryRouter>);
      fireEvent.click(screen.getByTestId('product-create-button'));
      fireEvent.change(screen.getByTestId('product-name-input'), { target: { value: 'New Product' } });
      fireEvent.change(screen.getByTestId('product-price-input'), { target: { value: 100 } });
      fireEvent.change(screen.getByTestId('product-quantity-input'), { target: { value: 10 } });
      fireEvent.click(screen.getByTestId('product-submit-button'));
      const errorMsg = await screen.findByText(/Không thể tạo sản phẩm/i);
      expect(errorMsg).toBeInTheDocument();
    });

    test('TC14: Failure - Lỗi khi xóa sản phẩm (Delete Error)', async () => {
      const mockProduct = { id: 'p1', name: 'Laptop X', price: 100, stockQuantity: 5, status: 'ACTIVE' };
      mockedProductService.getProducts.mockResolvedValue([mockProduct] as any);
      mockedProductService.deleteProduct.mockRejectedValue(new Error('Delete Failed'));
      render(<MemoryRouter><Products /></MemoryRouter>);
      const deleteBtn = await screen.findByTestId('product-delete-button');
      fireEvent.click(deleteBtn);
      const errorMsg = await screen.findByText(/Không thể xóa sản phẩm/i);
      expect(errorMsg).toBeInTheDocument();
    });

    test('TC15: Auth - Redirect về Login nếu chưa đăng nhập', async () => {
      mockedIsAuthenticated.mockReturnValue(false); 
      render(<MemoryRouter><Products /></MemoryRouter>);
      expect(screen.queryByText('Danh sách sản phẩm')).not.toBeInTheDocument();
    });
  });

  // ==========================================
  //      VERIFY MOCK CALLS & ADVANCED LOGIC
  // ==========================================
  describe('c) Verify all mock calls & Advanced Logic', () => {
    
    test('TC7: Cancel - Hủy xóa sản phẩm (Click Cancel)', async () => {
      const mockProducts = [{ id: 'p1', name: 'Laptop X', price: 100, stockQuantity: 5, status: 'ACTIVE' }];
      mockedProductService.getProducts.mockResolvedValue(mockProducts as any);
      (window.confirm as Mock).mockReturnValue(false);
      render(<MemoryRouter><Products /></MemoryRouter>);
      const deleteBtn = await screen.findByTestId('product-delete-button');
      fireEvent.click(deleteBtn);
      expect(mockedProductService.deleteProduct).not.toHaveBeenCalled();
    });

    test('TC10: Logic - Tìm kiếm sản phẩm', async () => {
      const mockProducts = [
        { id: 'p1', name: 'Laptop Dell', price: 100, stockQuantity: 5, status: 'ACTIVE' },
        { id: 'p2', name: 'Macbook', price: 200, stockQuantity: 5, status: 'ACTIVE' }
      ];
      mockedProductService.getProducts.mockResolvedValue(mockProducts as any);
      render(<MemoryRouter><Products /></MemoryRouter>);
      await screen.findByText('Laptop Dell');
      fireEvent.change(screen.getByTestId('product-search-input'), { target: { value: 'Dell' } });
      expect(screen.getByText('Laptop Dell')).toBeInTheDocument();
      expect(screen.queryByText('Macbook')).not.toBeInTheDocument();
    });

    test('TC11: Cancel - Hủy thêm mới sản phẩm', async () => {
      mockedProductService.getProducts.mockResolvedValue([]);
      render(<MemoryRouter><Products /></MemoryRouter>);
      fireEvent.click(screen.getByTestId('product-create-button'));
      expect(screen.getByTestId('product-name-input')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('product-cancel-button'));
      expect(screen.queryByTestId('product-name-input')).not.toBeInTheDocument();
    });

    test('TC12: Cancel - Hủy chỉnh sửa sản phẩm', async () => {
      const mockProduct = { id: 'p1', name: 'Laptop X', price: 100, stockQuantity: 5, status: 'ACTIVE' };
      mockedProductService.getProducts.mockResolvedValue([mockProduct] as any);
      render(<MemoryRouter><Products /></MemoryRouter>);
      const editBtn = await screen.findByTestId('product-edit-button');
      fireEvent.click(editBtn);
      expect(screen.getByTestId('product-inline-save-button')).toBeInTheDocument();
      const cancelBtn = screen.getByTestId('product-inline-cancel-button');
      fireEvent.click(cancelBtn);
      expect(screen.queryByTestId('product-inline-save-button')).not.toBeInTheDocument();
    });

    test('TC16: Logic - Reload khi có sự kiện authChanged', async () => {
      mockedIsAuthenticated.mockReturnValue(true);
      mockedProductService.getProducts.mockResolvedValue([]);
      render(<MemoryRouter><Products /></MemoryRouter>);
      act(() => { window.dispatchEvent(new Event('authChanged')); });
      await waitFor(() => {
          expect(mockedProductService.getProducts).toHaveBeenCalledTimes(2);
      });
    });

    test('TC17: Coverage - Nhập liệu đầy đủ Form Tạo mới (Cover onChange)', async () => {
      mockedProductService.getProducts.mockResolvedValue([]);
      render(<MemoryRouter><Products /></MemoryRouter>);
      fireEvent.click(screen.getByTestId('product-create-button'));
      const descInput = screen.getByPlaceholderText('Nhập mô tả');
      fireEvent.change(descInput, { target: { value: 'Mô tả chi tiết sản phẩm' } });
      const statusInput = screen.getByPlaceholderText('ACTIVE'); 
      fireEvent.change(statusInput, { target: { value: 'INACTIVE' } });
      fireEvent.change(screen.getByTestId('product-name-input'), { target: { value: 'Test Product' } });
    });

    test('TC18: Coverage - Nhập liệu đầy đủ Form Sửa (Cover onChange)', async () => {
      const mockProduct = { id: 'p1', name: 'Old Name', price: 10, stockQuantity: 1, status: 'ACTIVE', description: 'Old Desc' };
      mockedProductService.getProducts.mockResolvedValue([mockProduct] as any);
      render(<MemoryRouter><Products /></MemoryRouter>);
      const editBtns = await screen.findAllByTestId('product-edit-button');
      fireEvent.click(editBtns[0]);
      const descInput = screen.getByTestId('product-inline-description-input');
      fireEvent.change(descInput, { target: { value: 'New Description' } });
      const priceInput = screen.getByTestId('product-inline-price-input');
      fireEvent.change(priceInput, { target: { value: 999 } });
      const qtyInput = screen.getByTestId('product-inline-quantity-input');
      fireEvent.change(qtyInput, { target: { value: 99 } });
      const statusInput = screen.getByTestId('product-inline-status-input');
      fireEvent.change(statusInput, { target: { value: 'SOLD_OUT' } });
    });
  });

});