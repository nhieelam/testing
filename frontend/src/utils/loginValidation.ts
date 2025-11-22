export interface Product {
  name: string;
  price: number | string;
  quantity: number | string;
  description?: string;
  category: string;
}


export const validateProduct = (product: Product): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Product Name 
if (!product.name) {
  errors.name = 'Tên sản phẩm không được để trống';
  } else if (product.name.length < 3) {
  errors.name = 'Tên sản phẩm phải có ít nhất 3 ký tự';
  } else if (product.name.length > 100) { 
  errors.name = 'Tên sản phẩm không được vượt quá 100 ký tự';
}

  // Price 
  const price = Number(product.price);
  if (product.price === null || product.price === undefined || product.price === '') {
    errors.price = 'Giá sản phẩm không được để trống';
  } else if (isNaN(price)) {
    errors.price = 'Giá sản phẩm phải là một con số';
  } else if (price <= 0) {
    errors.price = 'Giá sản phẩm phải lớn hơn 0';
  } else if (price > 999_999_999) {
    errors.price = 'Giá sản phẩm không được vượt quá 999,999,999';
  }

  // Quantity
  const quantity = Number(product.quantity);
  if (product.quantity === null || product.quantity === undefined || product.quantity === '') {
    errors.quantity = 'Số lượng không được để trống';
  } else if (isNaN(quantity) || !Number.isInteger(quantity)) {
    errors.quantity = 'Số lượng phải là số nguyên';
  } else if (quantity < 0) {
    errors.quantity = 'Số lượng không được âm';
  } else if (quantity > 99_999) {
    errors.quantity = 'Số lượng không được vượt quá 99,999';
  }

  // Description
  if (product.description && product.description.length > 500) {
    errors.description = 'Mô tả không được vượt quá 500 ký tự';
  }

  // Category
  if (!product.category) {
    errors.category = 'Danh mục không được để trống';
  }

  return errors;
};

export interface LoginValidationResult {
  usernameError: string | null
  passwordError: string | null
}

export function validateLoginForm(username: string, password: string): LoginValidationResult {
  let usernameError: string | null = null
  let passwordError: string | null = null

  const trimmedUsername = username.trim()
  const trimmedPassword = password.trim()

  if (!trimmedUsername) {
    usernameError = 'Tên đăng nhập không được để trống'
  } else if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
    usernameError = 'tên đăng nhập không hợp lệ'
  }

if (!trimmedPassword) {
  passwordError = 'Mật khẩu là bắt buộc'
} else if (trimmedPassword.length < 6 || trimmedPassword.length > 100) {
  passwordError = 'Mật khẩu phải từ 6 đến 100 ký tự'
} else if (!(/[A-Za-z]/.test(trimmedPassword) && /\d/.test(trimmedPassword))) {
  passwordError = 'Mật khẩu phải chứa cả chữ và số'
}


  return { usernameError, passwordError }
}


