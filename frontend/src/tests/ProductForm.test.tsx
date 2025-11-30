import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Products from '../pages/Products';
// SỬA: Import productUtils để mock validateProductPayload, toProductPayload, emptyNewProduct
import * as productUtils from '../utils/productUtils';
import * as productService from '../services/productService';
// THÊM: Import authUtils để mock isAuthenticated
import * as authUtils from '../utils/auth';
import { vi } from 'vitest';

// Mock productUtils
vi.mock('../utils/productUtils', () => ({
  validateProductPayload: vi.fn(),
  emptyNewProduct: vi.fn(),
  toProductPayload: vi.fn(),
  formatPrice: vi.fn((price) => `${price} VND`),
}));

vi.mock('../services/productService', () => ({
  getProducts: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

//Mock isAuthenticated
vi.mock('../utils/auth', () => ({
  isAuthenticated: vi.fn().mockReturnValue(true),
}));


const mockedValidatePayload = vi.mocked(productUtils).validateProductPayload;
const mockedEmptyNewProduct = vi.mocked(productUtils).emptyNewProduct;
const mockedToProductPayload = vi.mocked(productUtils).toProductPayload;
const mockedProductService = vi.mocked(productService);
const mockedIsAuthenticated = vi.mocked(authUtils).isAuthenticated;

describe('Products Component - Form Validation Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    mockedProductService.getProducts.mockResolvedValue([]);
    mockedIsAuthenticated.mockReturnValue(true);

    // SETUP MOCK CƠ SỞ:
    mockedEmptyNewProduct.mockReturnValue({ name: '', description: '', price: 0, stockQuantity: 0, status: 'ACTIVE' });
    mockedToProductPayload.mockImplementation((p) => ({
      name: p.name || '',
      description: p.description || '',
      price: Number(p.price) || 0,
      stockQuantity: Number(p.stockQuantity) || 0,
      status: p.status || 'ACTIVE',
    }));
    // Mặc định validatePayload trả về hợp lệ
    mockedValidatePayload.mockReturnValue({ valid: true });
  });

  test('TC1: Hiển thị form Thêm sản phẩm khi nhấn nút', async () => {
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    const addButton = await screen.findByRole('button', { name: /thêm sản phẩm/i });
    fireEvent.click(addButton);
    expect(await screen.findByText('Thêm sản phẩm mới')).toBeInTheDocument();
  });

  test('TC2: Hiển thị lỗi validation khi submit form rỗng', async () => {
    mockedValidatePayload.mockReturnValue({
      valid: false,
      error: 'Tên sản phẩm không được để trống',
    });

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole('button', { name: /thêm sản phẩm/i }));
    const createBtn = await screen.findByRole('button', { name: /tạo sản phẩm/i });
    fireEvent.click(createBtn);

    // Verify
    expect(mockedValidatePayload).toHaveBeenCalled();
    expect(await screen.findByText('Tên sản phẩm không được để trống')).toBeInTheDocument();
  });

  test('TC3: Không lỗi khi submit form hợp lệ', async () => {
    mockedValidatePayload.mockReturnValue({ valid: true });

    mockedProductService.createProduct.mockResolvedValue({
      id: 'uuid-123',
      name: 'Điện thoại',
      price: 5000000,
      stockQuantity: 10,
      status: 'ACTIVE',
    });

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole('button', { name: /thêm sản phẩm/i }));

    // 1. Nhập Tên sản phẩm
    fireEvent.change(await screen.findByPlaceholderText('Nhập tên sản phẩm'), {
      target: { value: 'Laptop Dell' },
    });

    // 2. Nhập Giá sản phẩm
    const priceInput = screen.getAllByPlaceholderText('0')[0];

    fireEvent.change(priceInput, {
      target: { value: '15000000' },
    });

    fireEvent.click(screen.getByRole('button', { name: /tạo sản phẩm/i }));

    await waitFor(() => {
      expect(mockedValidatePayload).toHaveBeenCalled();
      expect(mockedProductService.createProduct).toHaveBeenCalled();
    });
  });
});