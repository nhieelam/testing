import { vi } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from "react-router-dom";
import ProductList from '../pages/Products';
import * as authUtils from '../utils/auth';
import * as productService from '../services/productService';

// Mock API
vi.mock('../services/productService', () => ({
  getProducts: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  getProductById: vi.fn(),
}));

vi.mock('../utils/auth', () => ({
  isAuthenticated: vi.fn().mockReturnValue(true),
}));

const mockedProductService = vi.mocked(productService);

describe('Products Component - a) ProductList Tests', () => {
  beforeEach(() => {
    mockedProductService.getProducts.mockClear();
    vi.mocked(authUtils).isAuthenticated.mockReturnValue(true);
  });

  test('TC1: Lấy danh sách sản phẩm thành công khi API trả về dữ liệu hợp lệ', async () => {
    const mockProducts = [
      { id: 'uuid-1', name: 'Laptop', price: 15000000, stockQuantity: 10, status: 'ACTIVE' },
      { id: 'uuid-2', name: 'Mouse', price: 200000, stockQuantity: 50, status: 'ACTIVE' },
    ];

    mockedProductService.getProducts.mockResolvedValue(mockProducts);

    render(
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockedProductService.getProducts).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('Mouse')).toBeInTheDocument();
    });
  });

  test('TC2: Hiển thị thông báo "Không có sản phẩm nào" khi không có sản phẩm', async () => {
    mockedProductService.getProducts.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockedProductService.getProducts).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Không có sản phẩm nào')).toBeInTheDocument();
    });
  });

  test('TC3: Hiển thị thông báo lỗi khi API lỗi khi lấy danh sách sản phẩm', async () => {
    mockedProductService.getProducts.mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockedProductService.getProducts).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Không thể tải danh sách sản phẩm. Vui lòng thử lại.')).toBeInTheDocument();
    });
  });
});


describe('Products Component - ProductForm Tests (Create/Edit)', () => {
  beforeEach(() => {
    mockedProductService.getProducts.mockClear();
    mockedProductService.createProduct.mockClear();
    mockedProductService.updateProduct.mockClear();
    vi.mocked(authUtils).isAuthenticated.mockReturnValue(true);
    mockedProductService.getProducts.mockResolvedValue([]);
  });

  test('TC1: Hiển thị form thêm sản phẩm khi nhấn nút "+ Thêm sản phẩm"', async () => {
    render(
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>
    );

    screen.getByText('+ Thêm sản phẩm').click();

    expect(await screen.findByPlaceholderText("Nhập tên sản phẩm")).toBeInTheDocument();
    expect(await screen.findByPlaceholderText("Nhập mô tả")).toBeInTheDocument();
    expect(await screen.findByTestId('product-price-input')).toBeInTheDocument();
    expect(await screen.findByTestId('product-quantity-input')).toBeInTheDocument();
    expect(screen.getByText('Tạo sản phẩm')).toBeInTheDocument();
    await waitFor(() => {
      expect(mockedProductService.getProducts).toHaveBeenCalledTimes(1);
    });
  });

  test('TC2: Tạo sản phẩm mới thành công khi gửi dữ liệu hợp lệ', async () => {
    mockedProductService.createProduct.mockResolvedValue({ id: 'uuid-1', name: 'Laptop', price: 15000000, stockQuantity: 10, status: 'ACTIVE' });

    render(
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>
    );

    screen.getByText('+ Thêm sản phẩm').click();

    fireEvent.change(await screen.findByPlaceholderText('Nhập tên sản phẩm'), { target: { value: 'iPhone' } });
    fireEvent.change(await screen.findByPlaceholderText('Nhập mô tả'), { target: { value: 'Flagship' } });
    fireEvent.change(await screen.findByTestId('product-price-input'), { target: { value: 29990000 } });
    fireEvent.change(await screen.findByTestId('product-quantity-input'), { target: { value: 20 } });

    screen.getByText('Tạo sản phẩm').click();

    await waitFor(() => {
      expect(mockedProductService.getProducts).toHaveBeenCalledTimes(2);
      expect(mockedProductService.createProduct).toHaveBeenCalledTimes(1);
    });

    expect(mockedProductService.createProduct).toHaveBeenCalledWith({
      name: 'iPhone',
      description: 'Flagship',
      price: 29990000,
      stockQuantity: 20,
      status: 'ACTIVE',
    });
  });

  test('TC3: Chỉnh sửa sản phẩm thành công khi gửi dữ liệu hợp lệ', async () => {
    mockedProductService.getProducts.mockResolvedValue([{
      id: 'uuid-1',
      name: 'Laptop',
      description: 'Gaming',
      price: 15000000,
      stockQuantity: 10,
      status: 'ACTIVE',
    }]);

    mockedProductService.updateProduct.mockResolvedValue({
      id: 'uuid-1',
      name: 'Laptop MSI',
      description: 'Gaming',
      price: 15000000,
      stockQuantity: 10,
      status: 'ACTIVE',
    });

    render(
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>
    );

    const updateButton = await screen.findAllByText('Sửa');
    fireEvent.click(updateButton[0]);

    fireEvent.change(await screen.findByPlaceholderText('Tên sản phẩm'), { target: { value: 'Laptop MSI' } });

    const saveButton = await screen.findByText('Lưu');
    saveButton.click();

    await waitFor(() => {
      expect(mockedProductService.updateProduct).toHaveBeenCalledTimes(1);
      expect(mockedProductService.getProducts).toHaveBeenCalledTimes(2);
    });

    expect(mockedProductService.updateProduct).toHaveBeenCalledWith('uuid-1', {
      name: 'Laptop MSI',
      description: 'Gaming',
      price: 15000000,
      stockQuantity: 10,
      status: 'ACTIVE',
    });
  });

});

describe('Products Component - c) ProductDetail Tests', () => {
  const mockProduct = {
    id: 'uuid-1',
    name: 'Laptop',
    description: 'Gaming',
    price: 15000000,
    stockQuantity: 10,
    status: 'ACTIVE',
  };

  beforeEach(() => {
    mockedProductService.getProducts.mockResolvedValue([mockProduct]);
    mockedProductService.getProductById.mockClear();
    vi.mocked(authUtils).isAuthenticated.mockReturnValue(true);
  });

  test('TC1: Mở và hiển thị chi tiết sản phẩm thành công khi nhấn nút "Chi tiết"', async () => {
    mockedProductService.getProductById.mockResolvedValue(mockProduct);

    render(
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>
    );

    const detailButton = await screen.findAllByText('Chi tiết');
    fireEvent.click(detailButton[0]);

    const modalHeading = await screen.findByText('Chi tiết sản phẩm');
    expect(modalHeading).toBeInTheDocument();

    const productDetailModal = modalHeading.closest('div.bg-white') as HTMLElement;
    expect(productDetailModal).toBeInTheDocument();

    const withinModal = within(productDetailModal);

    expect(withinModal.getByText(mockProduct.name)).toBeInTheDocument();
    expect(withinModal.getByText(mockProduct.id)).toBeInTheDocument();
    expect(withinModal.getByText('15.000.000 ₫')).toBeInTheDocument(); // Cập nhật giá cho sản phẩm mới
    expect(withinModal.getByText(mockProduct.description)).toBeInTheDocument();
    expect(withinModal.getByRole('button', { name: 'Đóng' })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedProductService.getProductById).toHaveBeenCalledTimes(1);
      expect(mockedProductService.getProductById).toHaveBeenCalledWith(mockProduct.id);
    });
  });

  test('TC2: Đóng khung chi tiết sản phẩm khi nhấn nút "Đóng"', async () => {
    mockedProductService.getProductById.mockResolvedValue(mockProduct);

    render(
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>
    );

    const viewDetailsButton = await screen.findByRole('button', { name: 'Chi tiết' });
    fireEvent.click(viewDetailsButton);

    await waitFor(() => {
      expect(screen.getByText('Chi tiết sản phẩm')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: 'Đóng' });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Chi tiết sản phẩm')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Đóng' })).not.toBeInTheDocument();
    });
  });

  test('TC3: Hiển thị thông báo lỗi khi API lấy chi tiết sản phẩm thất bại', async () => {
    mockedProductService.getProductById.mockRejectedValue(new Error('Product not found'));

    render(
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    const viewDetailsButton = screen.getByRole('button', { name: 'Chi tiết' });
    fireEvent.click(viewDetailsButton);

    await waitFor(() => {
      expect(mockedProductService.getProductById).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Không thể tải thông tin sản phẩm. Vui lòng thử lại.')).toBeInTheDocument();
    });
    expect(screen.queryByText('Chi tiết sản phẩm')).not.toBeInTheDocument();
  });
});