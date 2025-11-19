import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Products from './Products'
import type { Mock } from 'vitest'
import * as productService from '../services/productService'

vi.mock('../services/productService')

const mockedGetProducts = productService.getProducts as unknown as Mock 
const mockedCreateProduct = productService.createProduct as unknown as Mock 
const mockedDeleteProduct = productService.deleteProduct as unknown as Mock 

window.confirm = vi.fn(() => true)

vi.mock('../utils/auth', () => ({
  isAuthenticated: vi.fn(() => true),
  getToken: vi.fn(() => 'fake-token'),
}))

describe('Products Component Mock Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks() 
    ;(window.confirm as Mock).mockReturnValue(true)
  })

  //
  test('TC1: Mock - Tải và hiển thị danh sách sản phẩm', async () => {
    const mockProducts = [
      { id: '1', name: 'Laptop Dell', price: 15000, stockQuantity: 10 },
      { id: '2', name: 'Chuột Logitech', price: 200, stockQuantity: 50 },
    ]
    mockedGetProducts.mockResolvedValue(mockProducts)

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Laptop Dell')).toBeInTheDocument()
    expect(screen.getByText('Chuột Logitech')).toBeInTheDocument()
    //
    expect(mockedGetProducts).toHaveBeenCalledTimes(1)
  })

  //
  test('TC2: Mock - Tạo sản phẩm mới thành công', async () => {
    // 1. Setup Mock
    mockedGetProducts.mockResolvedValue([])
    mockedCreateProduct.mockResolvedValue({
      id: '3',
      name: 'Bàn phím cơ',
      price: 1000,
      stockQuantity: 5,
    })

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByTestId('product-create-button'))

    fireEvent.change(screen.getByTestId('product-name-input'), {
      target: { value: 'Bàn phím cơ' },
    })
    fireEvent.change(screen.getByTestId('product-price-input'), {
      target: { value: 1000 },
    })
    fireEvent.change(screen.getByTestId('product-quantity-input'), {
      target: { value: 5 },
    })

    fireEvent.click(screen.getByTestId('product-submit-button'))

    await waitFor(() => {
      //
      expect(mockedCreateProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Bàn phím cơ',
          price: 1000,
          stockQuantity: 5,
        }),
      )
    })

    expect(mockedGetProducts).toHaveBeenCalledTimes(2)
  })

  //
  test('TC3: Mock - Xóa sản phẩm thành công', async () => {
    const mockProducts = [
      { id: '1', name: 'Laptop Dell', price: 15000, stockQuantity: 10 },
    ]
    mockedGetProducts.mockResolvedValue(mockProducts)
    mockedDeleteProduct.mockResolvedValue(undefined)

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>,
    )

    const deleteButton = await screen.findByTestId('product-delete-button')

    fireEvent.click(deleteButton)

    expect(window.confirm).toHaveBeenCalledWith('Bạn có chắc chắn muốn xóa sản phẩm này?')

    await waitFor(() => {
      //
      expect(mockedDeleteProduct).toHaveBeenCalledWith('1')
    })

    expect(mockedGetProducts).toHaveBeenCalledTimes(2)
  })

  //
  test('TC4: Mock - Hiển thị lỗi khi tải sản phẩm thất bại', async () => {
    mockedGetProducts.mockRejectedValue(
      new Error('Không thể tải danh sách sản phẩm. Vui lòng thử lại.'),
    )

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>,
    )

    const errorElement = await screen.findByText(
      /Không thể tải danh sách sản phẩm/i,
    )
    expect(errorElement).toBeInTheDocument()
  })
})