import { vi } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductList from '../pages/Products';
import * as authUtils from '../utils/auth';
import * as productService from '../services/productService';
import userEvent from '@testing-library/user-event';

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
      <BrowserRouter>
        <ProductList />
      </BrowserRouter>
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
      <BrowserRouter>
        <ProductList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockedProductService.getProducts).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Không có sản phẩm nào')).toBeInTheDocument();
    });
  });

  test('TC3: Hiển thị thông báo lỗi khi API lỗi khi lấy danh sách sản phẩm', async () => {
    mockedProductService.getProducts.mockRejectedValue(new Error('Network error'));

    render(
      <BrowserRouter>
        <ProductList />
      </BrowserRouter>
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
    render(<BrowserRouter><ProductList /></BrowserRouter>);

    await waitFor(() => {
      expect(mockedProductService.getProducts).toHaveBeenCalledTimes(1);
    });

    screen.getByText('+ Thêm sản phẩm').click();

    const nameInput = await screen.findByPlaceholderText('Nhập tên sản phẩm');
    const descInput = await screen.findByPlaceholderText('Nhập mô tả');
    const priceInput = await waitFor(() =>
      document.querySelector<HTMLInputElement>('[data-text="product-price-input"]')
    );
    const quantityInput = await waitFor(() =>
      document.querySelector<HTMLInputElement>('[data-text="product-quantity-input"]')
    );

    expect(nameInput).toBeInTheDocument();
    expect(descInput).toBeInTheDocument();
    expect(priceInput).toBeInTheDocument();
    expect(quantityInput).toBeInTheDocument();
    expect(screen.getByText('Tạo sản phẩm')).toBeInTheDocument();
  });

  test('TC2: Tạo sản phẩm mới thành công khi gửi dữ liệu hợp lệ', async () => {
    mockedProductService.createProduct.mockResolvedValue({
      id: "1",
      name: "Test product",
      price: 100,
      stockQuantity: 5,
    });

    render(<BrowserRouter><ProductList /></BrowserRouter>);

    await waitFor(() => {
      expect(mockedProductService.getProducts).toHaveBeenCalledTimes(1);
    });

    screen.getByText('+ Thêm sản phẩm').click();

    const nameInput = await screen.findByPlaceholderText('Nhập tên sản phẩm');
    const descInput = await screen.findByPlaceholderText('Nhập mô tả');
    const priceInput = await document.querySelector<HTMLInputElement>('[data-text="product-price-input"]')!;
    const quantityInput = await document.querySelector<HTMLInputElement>('[data-text="product-quantity-input"]')!;

    await userEvent.type(nameInput, 'iPhone');
    await userEvent.type(descInput, 'Flagship');
    await userEvent.clear(priceInput);
    await userEvent.type(priceInput, '29990000');
    await userEvent.clear(quantityInput);
    await userEvent.type(quantityInput, '20');

    screen.getByText('Tạo sản phẩm').click();

    await waitFor(() => {
      expect(mockedProductService.createProduct).toHaveBeenCalledTimes(1);
    });

    expect(mockedProductService.createProduct).toHaveBeenCalledWith({
      name: 'iPhone',
      description: 'Flagship',
      price: Number(priceInput.value),
      stockQuantity: Number(quantityInput.value),
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

    render(<BrowserRouter><ProductList /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    screen.getByText('Sửa').click();

    const nameInput = await screen.findByPlaceholderText('Tên sản phẩm');
    const descInput = await screen.findByPlaceholderText('Mô tả');
    const priceInput = await waitFor(() =>
      document.querySelector<HTMLInputElement>('[data-text="product-inline-price-input"]')!
    );
    const quantityInput = await waitFor(() =>
      document.querySelector<HTMLInputElement>('[data-text="product-inline-quantity-input"]')!
    );
    const statusInput = await screen.findByPlaceholderText('ACTIVE');

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Laptop MSI');
    await userEvent.clear(descInput);
    await userEvent.type(descInput, 'Gaming');
    await userEvent.clear(priceInput);
    await userEvent.type(priceInput, '15000000');
    await userEvent.clear(quantityInput);
    await userEvent.type(quantityInput, '10');
    await userEvent.clear(statusInput);
    await userEvent.type(statusInput, 'ACTIVE');

    const saveButton = await screen.findByText('Lưu');
    saveButton.click();

    await waitFor(() => {
      expect(mockedProductService.updateProduct).toHaveBeenCalledTimes(1);
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
    id: 'uuid-123',
    name: 'Máy ảnh Mirrorless',
    description: 'Máy ảnh chuyên nghiệp',
    price: 45000000,
    stockQuantity: 5,
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
      <BrowserRouter>
        <ProductList />
      </BrowserRouter>
    );

    const viewDetailsButton = await screen.findByRole('button', { name: 'Chi tiết' });
    expect(viewDetailsButton).toBeInTheDocument();

    fireEvent.click(viewDetailsButton);

    const modalHeading = await screen.findByRole('heading', { name: 'Chi tiết sản phẩm' });
    expect(modalHeading).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedProductService.getProductById).toHaveBeenCalledTimes(1);
      expect(mockedProductService.getProductById).toHaveBeenCalledWith(mockProduct.id);
    });

    const productDetailModal = modalHeading.closest('div.bg-white') as HTMLElement;
    if (!productDetailModal) throw new Error("Không tìm thấy container modal.");

    const withinModal = within(productDetailModal);

    expect(withinModal.getByText(mockProduct.name)).toBeInTheDocument();
    expect(withinModal.getByText(mockProduct.id)).toBeInTheDocument();
    expect(withinModal.getByText('45.000.000 ₫')).toBeInTheDocument();
    expect(withinModal.getByText(mockProduct.description)).toBeInTheDocument();
    expect(withinModal.getByRole('button', { name: 'Đóng' })).toBeInTheDocument();
  });

  test('TC2: Đóng khung chi tiết sản phẩm khi nhấn nút "Đóng"', async () => {
    mockedProductService.getProductById.mockResolvedValue(mockProduct);

    render(
      <BrowserRouter>
        <ProductList />
      </BrowserRouter>
    );

    const viewDetailsButton = await screen.findByRole('button', { name: 'Chi tiết' });
    expect(viewDetailsButton).toBeInTheDocument();
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
    // mmock API lấy chi tiết sản phẩm bị lỗi
    mockedProductService.getProductById.mockRejectedValue(new Error('Product not found'));

    render(
      <BrowserRouter>
        <ProductList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Máy ảnh Mirrorless')).toBeInTheDocument();
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