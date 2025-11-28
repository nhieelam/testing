import type { ProductDto } from '../services/productService'

export function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

export function emptyNewProduct(): Omit<ProductDto, 'id'> {
  return {
    name: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    status: 'ACTIVE',
  }
}

export function toProductPayload(p: Partial<ProductDto> | ProductDto): Omit<ProductDto, 'id'> {
  return {
    name: (p.name || '').toString().trim(),
    description: (p.description || '').toString(),
    price: Number(p.price) || 0,
    stockQuantity: Number(p.stockQuantity) || 0,
    status: (p.status || 'ACTIVE').toString(),
  }
}

export function validateProductPayload(payload: Partial<ProductDto> | Omit<ProductDto, 'id'>) {
  if (!payload.name || String(payload.name).trim().length === 0) {
    return { valid: false, error: 'Tên sản phẩm không được để trống' }
  }
  const price = Number(payload.price)
  if (Number.isNaN(price) || price < 0) {
    return { valid: false, error: 'Giá phải là số >= 0' }
  }
  const qty = Number(payload.stockQuantity)
  if (Number.isNaN(qty) || qty < 0) {
    return { valid: false, error: 'Số lượng phải là số >= 0' }
  }
  return { valid: true }
}
