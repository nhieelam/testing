import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
// SỬA LỖI Ở DÒNG DƯỚI: Đổi từ './Products' thành '../pages/Products'
import Products from '../pages/Products'; 
import * as productService from '../services/productService';
import * as authUtils from '../utils/auth';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// ==========================================
// 1. THIẾT LẬP MOCK (GIẢ LẬP)
// ==========================================

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

vi.mock('../services/productService', () => ({
  getProducts: vi.fn(),
  getProductById: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

vi.mock('../utils/auth', () => ({
  isAuthenticated: vi.fn(),
}));

// Mock Utils
vi.mock('../utils/productUtils', async () => {
  return {
    formatPrice: (price: number) => `${price} VND`,
    emptyNewProduct: () => ({ name: '', description: '', price: 0, stockQuantity: 0, status: 'ACTIVE' }),
    toProductPayload: (p: any) => p,
    validateProductPayload: (p: any) => {
      if (!p.name) return { valid: false, error: 'Tên sản phẩm không được để trống' };
      return { valid: true };
    }
  };
});

const mockedProductService = vi.mocked(productService);
const mockedIsAuthenticated = vi.mocked(authUtils.isAuthenticated);

// ==========================================
// 2. BỘ TEST (TEST SUITE)
// ==========================================

describe('Products Component Coverage', () => {
  const mockProducts = [
    { id: '1', name: 'Product A', price: 100, stockQuantity: 5, status: 'ACTIVE', description: 'Desc A' },
    { id: '2', name: 'Product B', price: 200, stockQuantity: 10, status: 'INACTIVE', description: 'Desc B' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockedIsAuthenticated.mockReturnValue(true);
    mockedProductService.getProducts.mockResolvedValue(mockProducts);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- Test chuyển hướng khi chưa đăng nhập ---
  it('chuyển hướng về /404 nếu chưa xác thực', async () => {
    mockedIsAuthenticated.mockReturnValue(false);
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/404');
    });
  });

  // --- Test hiển thị danh sách ---
  it('hiển thị danh sách sản phẩm thành công', async () => {
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );
    expect(await screen.findByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Product B')).toBeInTheDocument();
  });

  // --- Test Fetch Error ---
  it('xử lý lỗi khi không tải được danh sách sản phẩm', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedProductService.getProducts.mockRejectedValue(new Error('API Error'));

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    expect(await screen.findByText('Không thể tải danh sách sản phẩm. Vui lòng thử lại.')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  // --- Test Create Error ---
  it('xử lý lỗi khi tạo sản phẩm thất bại', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByTestId('product-create-button'));
    fireEvent.change(screen.getByTestId('product-name-input'), { target: { value: 'New Item' } });
    fireEvent.change(screen.getByTestId('product-price-input'), { target: { value: '100' } });

    mockedProductService.createProduct.mockRejectedValue(new Error('Create Failed'));

    fireEvent.click(screen.getByTestId('product-submit-button'));

    expect(await screen.findByText('Không thể tạo sản phẩm. Vui lòng thử lại.')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  // --- Test Validation Error ---
  it('hiển thị lỗi validation khi tạo mới', async () => {
    render(
        <MemoryRouter>
          <Products />
        </MemoryRouter>
      );
      fireEvent.click(await screen.findByTestId('product-create-button'));
      fireEvent.change(screen.getByTestId('product-name-input'), { target: { value: '' } });
      fireEvent.click(screen.getByTestId('product-submit-button'));
      expect(await screen.findByText('Tên sản phẩm không được để trống')).toBeInTheDocument();
  });

  // --- Test Inline Edit (Full Flow) ---
  it('tương tác với tất cả input sửa trực tiếp và lưu thành công', async () => {
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    await screen.findByText('Product A');
    
    // 1. Vào chế độ sửa
    const editButtons = screen.getAllByTestId('product-edit-button');
    fireEvent.click(editButtons[0]);

    // 2. Tìm các input
    const nameInput = screen.getByTestId('product-inline-name-input');
    const descInput = screen.getByTestId('product-inline-description-input');
    const priceInput = screen.getByTestId('product-inline-price-input');
    const qtyInput = screen.getByTestId('product-inline-quantity-input');
    const statusInput = screen.getByTestId('product-inline-status-input');
    
    // 3. Thay đổi giá trị
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    fireEvent.change(descInput, { target: { value: 'Updated Desc' } });
    fireEvent.change(priceInput, { target: { value: '999' } });
    fireEvent.change(qtyInput, { target: { value: '50' } });
    fireEvent.change(statusInput, { target: { value: 'OUT_OF_STOCK' } });

    // 4. Lưu
    mockedProductService.updateProduct.mockResolvedValue({ 
        ...mockProducts[0], 
        name: 'Updated Name', 
        price: 999 
    });
    fireEvent.click(screen.getByTestId('product-inline-save-button'));

    await waitFor(() => {
      expect(mockedProductService.updateProduct).toHaveBeenCalledWith('1', expect.objectContaining({
        name: 'Updated Name',
        description: 'Updated Desc',
        price: 999,
        stockQuantity: 50,
        status: 'OUT_OF_STOCK'
      }));
    });
  });

  // --- Test Inline Edit Error ---
  it('xử lý lỗi khi sửa trực tiếp thất bại', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    await screen.findByText('Product A');
    fireEvent.click(screen.getAllByTestId('product-edit-button')[0]);
    
    mockedProductService.updateProduct.mockRejectedValue(new Error('Update failed'));
    fireEvent.click(screen.getByTestId('product-inline-save-button'));

    expect(await screen.findByText('Không thể cập nhật sản phẩm. Vui lòng thử lại.')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  // --- Test Cancel Edit ---
  it('hủy chế độ sửa trực tiếp', async () => {
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );
    await screen.findByText('Product A');
    fireEvent.click(screen.getAllByTestId('product-edit-button')[0]);
    expect(screen.getByTestId('product-inline-name-input')).toBeInTheDocument();
    
    fireEvent.click(screen.getByTestId('product-inline-cancel-button'));
    expect(screen.queryByTestId('product-inline-name-input')).not.toBeInTheDocument();
  });

  // --- Test Delete Error ---
  it('xử lý lỗi khi xóa thất bại', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockedProductService.deleteProduct.mockRejectedValue(new Error('Delete failed'));

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    await screen.findByText('Product A');
    fireEvent.click(screen.getAllByTestId('product-delete-button')[0]);

    expect(await screen.findByText('Không thể xóa sản phẩm. Vui lòng thử lại.')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
    confirmSpy.mockRestore();
  });

  // --- Test Cancel Delete ---
  it('không xóa nếu người dùng chọn Cancel', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    await screen.findByText('Product A');
    fireEvent.click(screen.getAllByTestId('product-delete-button')[0]);
    expect(mockedProductService.deleteProduct).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  // --- Test View Details ---
  it('xem chi tiết thành công và đóng modal', async () => {
    mockedProductService.getProductById.mockResolvedValue(mockProducts[0]);
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    await screen.findByText('Product A');
    fireEvent.click(screen.getAllByTestId('product-view-details-button')[0]);
    
    expect(await screen.findByText('Chi tiết sản phẩm')).toBeInTheDocument();
    
    // Check ID tồn tại (dùng getAllByText để tránh lỗi duplicate)
    const idLabels = screen.getAllByText('ID');
    expect(idLabels.length).toBeGreaterThan(0);

    // Đóng Modal
    fireEvent.click(screen.getByText('Đóng')); 
    await waitFor(() => {
        expect(screen.queryByText('Chi tiết sản phẩm')).not.toBeInTheDocument();
    });
  });

  // --- Test View Details Error ---
  it('xử lý lỗi khi xem chi tiết thất bại', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedProductService.getProductById.mockRejectedValue(new Error('Detail failed'));

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    await screen.findByText('Product A');
    fireEvent.click(screen.getAllByTestId('product-view-details-button')[0]);

    expect(await screen.findByText('Không thể tải thông tin sản phẩm. Vui lòng thử lại.')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  // --- Test Search ---
  it('lọc sản phẩm theo từ khóa tìm kiếm', async () => {
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );
    await screen.findByText('Product A');
    const searchInput = screen.getByTestId('product-search-input');
    fireEvent.change(searchInput, { target: { value: 'Product A' } });
    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.queryByText('Product B')).not.toBeInTheDocument();
  });

  // --- Test Create Success ---
  it('tạo sản phẩm thành công', async () => {
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByTestId('product-create-button'));
    
    fireEvent.change(screen.getByTestId('product-name-input'), { target: { value: 'New Product' } });
    fireEvent.change(screen.getByTestId('product-price-input'), { target: { value: '1000' } });
    fireEvent.change(screen.getByTestId('product-quantity-input'), { target: { value: '10' } });
    
    mockedProductService.createProduct.mockResolvedValue({ id: '3', name: 'New Product' } as any);

    fireEvent.click(screen.getByTestId('product-submit-button'));

    await waitFor(() => {
        expect(mockedProductService.createProduct).toHaveBeenCalled();
    });
  });
});