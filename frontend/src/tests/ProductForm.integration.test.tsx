import { vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom'; // Thêm Router
import ProductList from '../pages/Products'; 
import * as authUtils from '../utils/auth';
import * as productService from '../services/productService';

// SỬA LỖI MOCKING: Dùng vi.mock và định nghĩa các hàm mock
vi.mock('../services/productService', () => ({
  getProducts: vi.fn(), // Khai báo rõ ràng là vi.fn()
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

vi.mock('../utils/auth', () => ({
  isAuthenticated: vi.fn().mockReturnValue(true),
}));

// Cast service
const mockedProductService = vi.mocked(productService);

describe('Products Component - Mock List Tests', () => {

  beforeEach(() => {
    // Dùng vi.mockClear() thay vì jest.Mock
    mockedProductService.getProducts.mockClear(); 
    vi.mocked(authUtils).isAuthenticated.mockReturnValue(true);
  });

  test('TC1: Mock - Lấy danh sách sản phẩm thành công', async () => {
    // 2. Thiết lập mock
    const mockProducts = {
      content: [
        { id: 'uuid-1', name: 'Laptop', price: 15000000, stockQuantity: 10, status: 'ACTIVE' },
        { id: 'uuid-2', name: 'Mouse', price: 200000, stockQuantity: 50, status: 'ACTIVE' },
      ],
      totalPages: 1,
    };
    mockedProductService.getProducts.mockResolvedValue(mockProducts.content);

    // FIX ROUTER: Bọc component trong BrowserRouter
    render(<BrowserRouter><ProductList /></BrowserRouter>);

    await waitFor(() => {
      // 3. Kiểm tra API getProducts đã được gọi
      expect(mockedProductService.getProducts).toHaveBeenCalledTimes(1);
      // 4. Kiểm tra sản phẩm đã hiển thị
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('Mouse')).toBeInTheDocument();
    });
  });

  test('TC2: Mock - Hiển thị "Không có sản phẩm nào"', async () => {
    // 2. Thiết lập mock trả về mảng rỗng
    const mockEmptyPage = { content: [], totalPages: 0 };
    mockedProductService.getProducts.mockResolvedValue(mockEmptyPage.content);

    // FIX ROUTER
    render(<BrowserRouter><ProductList /></BrowserRouter>);

    // Chờ xử lý
    await waitFor(() => {
      // 3. Kiểm tra API đã được gọi
      expect(mockedProductService.getProducts).toHaveBeenCalledTimes(1);
      
      // 4. Kiểm tra thông báo hiển thị
      expect(screen.getByText('Không có sản phẩm nào')).toBeInTheDocument();
    });
  });
});