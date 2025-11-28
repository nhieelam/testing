import { getToken } from '../utils/auth'

const API_BASE_URL = 'http://localhost:8080'

export interface ProductDto {
  id: string
  name: string
  description?: string | null
  price: number
  stockQuantity: number
  status?: string | null
}

function authHeaders() {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function getProducts(): Promise<ProductDto[]> {
  const res = await fetch(`${API_BASE_URL}/api/products`, {
    method: 'GET',
    headers: authHeaders(),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || 'Failed to fetch products')
  }

  return res.json()
}

export async function createProduct(payload: Omit<ProductDto, 'id'>): Promise<ProductDto> {
  const res = await fetch(`${API_BASE_URL}/api/products`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || 'Failed to create product')
  }

  return res.json()
}

export async function updateProduct(id: string, payload: Omit<ProductDto, 'id'>): Promise<ProductDto> {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || 'Failed to update product')
  }

  return res.json()
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || 'Failed to delete product')
  }
}
