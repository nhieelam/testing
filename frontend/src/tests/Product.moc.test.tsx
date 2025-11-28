import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Products from '../pages/Products';
import * as productService from '../services/productService';
import * as authUtils from '../utils/auth'; 
import { vi } from 'vitest';

vi.mock('../services/productService', () => ({
  getProducts: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

// THÊM: Mock isAuthenticated để component Products render
vi.mock('../utils/auth', () => ({
  isAuthenticated: vi.fn().mockReturnValue(true),
}));

const mockedProductService = vi.mocked(productService);
const mockedIsAuthenticated = vi.mocked(authUtils).isAuthenticated;

interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  status: string;
  // SỬA LỖI Type Checking (TS2353): Thêm description vào interface
  description?: string; 
}

describe('Products Component - Mock Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    mockedIsAuthenticated.mockReturnValue(true); // Đảm bảo xác thực
  });

  test('TC1: Mock - Lấy danh sách sản phẩm thành công', async () => {
    const mockProducts: Product[] = [
      // SỬA LỖI Type Checking: Cung cấp description
      { id: 'p1', name: 'Laptop X', price: 12000000, stockQuantity: 5, status: 'ACTIVE', description: 'Mô tả A' },
      { id: 'p2', name: 'Mouse', price: 200000, stockQuantity: 50, status: 'ACTIVE', description: '' },
    ];
    mockedProductService.getProducts.mockResolvedValue(mockProducts);

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    await screen.findByText('Laptop X');

    expect(mockedProductService.getProducts).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Laptop X')).toBeInTheDocument();
  });

  test('TC2: Mock - Hiển thị "Không có sản phẩm nào"', async () => {
    mockedProductService.getProducts.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockedProductService.getProducts).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Không có sản phẩm nào')).toBeInTheDocument();
    });
  });

  test('TC3: Mock - Tạo sản phẩm thành công', async () => {
    // Lưu ý: Cần thêm description vào newProduct nếu ProductDto yêu cầu
    const newProduct: Product = {
      id: 'p3',
      
      name: 'Keyboard',
      price: 1000000,
      stockQuantity: 10,
      status: 'ACTIVE',
      description: '',
    };

    mockedProductService.createProduct.mockResolvedValue(newProduct);

    await mockedProductService.createProduct(newProduct);

    expect(mockedProductService.createProduct).toHaveBeenCalledWith(newProduct);
  });
});