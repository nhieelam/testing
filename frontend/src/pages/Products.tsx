import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'
import { formatPrice, emptyNewProduct, toProductPayload, validateProductPayload } from '../utils/productUtils'
import {
  getProducts as apiGetProducts,
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
} from '../services/productService'
import type { ProductDto } from '../services/productService'

type Product = ProductDto

export default function Products() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Product | null>(null)
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false)
  const [saving, setSaving] = useState<boolean>(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState<boolean>(false)
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>(emptyNewProduct())
  const [creating, setCreating] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Fetch products from API (via service)
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiGetProducts()
      setProducts(data)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Check authentication on mount and when auth changes
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      setIsAuthenticatedState(authenticated)
      if (!authenticated) {
        navigate('/login')
      } else {
        fetchProducts()
      }
    }

    checkAuth()

    // Listen for auth changes
    const handleAuthChanged = () => {
      checkAuth()
    }

    window.addEventListener('authChanged', handleAuthChanged)
    return () => {
      window.removeEventListener('authChanged', handleAuthChanged)
    }
  }, [navigate, fetchProducts])

  // If not authenticated, don't render (will redirect)
  if (!isAuthenticatedState) {
    return null
  }

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setEditForm({ ...product })
  }

  const handleSave = async () => {
    if (!editForm) return

    try {
      setSaving(true)
      setError(null)
      await apiUpdateProduct(editForm.id, {
        name: editForm.name,
        description: editForm.description || '',
        price: editForm.price,
        stockQuantity: editForm.stockQuantity,
        status: editForm.status || 'ACTIVE',
      })

      // Refresh the product list
      await fetchProducts()
      setEditingId(null)
      setEditForm(null)
    } catch (err) {
      console.error('Error updating product:', err)
      setError('Không thể cập nhật sản phẩm. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm(null)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      return
    }

    try {
      setDeleting(id)
      setError(null)
      await apiDeleteProduct(id)

      // Refresh the product list
      await fetchProducts()
    } catch (err) {
      console.error('Error deleting product:', err)
      setError('Không thể xóa sản phẩm. Vui lòng thử lại.')
    } finally {
      setDeleting(null)
    }
  }

  const handleCreate = async () => {
    try {
      setCreating(true)
      setError(null)

      const payload = toProductPayload(newProduct)
      const validation = validateProductPayload(payload)
      if (!validation.valid) {
        setError(validation.error || 'Dữ liệu sản phẩm không hợp lệ')
        return
      }

      await apiCreateProduct(payload)

      // Refresh the product list
      await fetchProducts()
      setShowAddForm(false)
      setNewProduct(emptyNewProduct())
    } catch (err) {
      console.error('Error creating product:', err)
      setError('Không thể tạo sản phẩm. Vui lòng thử lại.')
    } finally {
      setCreating(false)
    }
  }

  // formatPrice is provided by utils/productUtils
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Danh sách sản phẩm</h1>
              <p className="text-sm text-slate-500 mt-1">Quản lý và chỉnh sửa thông tin sản phẩm</p>
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:items-center">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-text="product-search-input"
                className="w-full md:w-64 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                data-text="product-create-button"
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                {showAddForm ? 'Hủy' : '+ Thêm sản phẩm'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Add Product Form */}
          {showAddForm && (
            <div className="mx-6 mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Thêm sản phẩm mới</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên sản phẩm</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên sản phẩm"
                    data-text="product-name-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
                  <input
                    type="text"
                    value={newProduct.description || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập mô tả"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giá</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    data-text="product-price-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng</label>
                  <input
                    type="number"
                    value={newProduct.stockQuantity}
                    onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    data-text="product-quantity-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
                  <input
                    type="text"
                    value={newProduct.status || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ACTIVE"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  data-text="product-submit-button"
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Đang tạo...' : 'Tạo sản phẩm'}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setNewProduct({
                      name: '',
                      description: '',
                      price: 0,
                      stockQuantity: 0,
                      status: 'ACTIVE',
                    })
                  }}
                  data-text="product-cancel-button"
                  className="px-4 py-2 bg-slate-200 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-300 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="px-6 py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-slate-500">Đang tải danh sách sản phẩm...</p>
            </div>
          )}

          {/* Products Table */}
          {!loading && (
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tên sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Số lượng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50 transition-colors"
                    data-text="product-row"
                  >
                    {editingId === product.id ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {product.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={editForm?.name || ''}
                            onChange={(e) => setEditForm(editForm ? { ...editForm, name: e.target.value } : null)}
                            className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Tên sản phẩm"
                            data-text="product-inline-name-input"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={editForm?.description || ''}
                            onChange={(e) => setEditForm(editForm ? { ...editForm, description: e.target.value } : null)}
                            className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Mô tả"
                            data-text="product-inline-description-input"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            value={editForm?.price || ''}
                            onChange={(e) => setEditForm(editForm ? { ...editForm, price: Number(e.target.value) } : null)}
                            className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            data-text="product-inline-price-input"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            value={editForm?.stockQuantity || ''}
                            onChange={(e) => setEditForm(editForm ? { ...editForm, stockQuantity: Number(e.target.value) } : null)}
                            className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            data-text="product-inline-quantity-input"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={editForm?.status || ''}
                            onChange={(e) => setEditForm(editForm ? { ...editForm, status: e.target.value } : null)}
                            className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="ACTIVE"
                            data-text="product-inline-status-input"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={handleSave}
                              disabled={saving}
                              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              data-text="product-inline-save-button"
                            >
                              {saving ? 'Đang lưu...' : 'Lưu'}
                            </button>
                            <button
                              onClick={handleCancel}
                              disabled={saving}
                              className="px-3 py-1.5 bg-slate-200 text-slate-700 text-sm rounded-md hover:bg-slate-300 transition-colors disabled:opacity-50"
                              data-text="product-inline-cancel-button"
                            >
                              Hủy
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {product.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                          {product.description || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {product.stockQuantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {product.status || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                              data-text="product-edit-button"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              disabled={deleting === product.id}
                              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              data-text="product-delete-button"
                            >
                              {deleting === product.id ? 'Đang xóa...' : 'Xóa'}
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-slate-500">Không có sản phẩm nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

