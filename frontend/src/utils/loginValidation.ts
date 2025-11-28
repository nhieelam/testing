export interface Product {
  name: string;
  price: number | string;
  quantity: number | string;
  description?: string;
  category: string;
}

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


