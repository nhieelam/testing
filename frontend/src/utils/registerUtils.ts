export const USERNAME_MIN = 3
export const USERNAME_MAX = 50
export const PASSWORD_MIN = 6
export const PASSWORD_MAX = 100

// Allowed username chars: letters, numbers, hyphen, dot, underscore
export const USERNAME_REGEX = /^[A-Za-z0-9._-]+$/

export function sanitizeUsername(username: unknown): string {
  if (typeof username !== 'string') return ''
  return username.trim()
}

export function validateRegistrationInput(username: unknown, password: unknown, confirm: unknown): { valid: boolean; error?: string } {
  const name = sanitizeUsername(username)
  if (!name) return { valid: false, error: 'Tên đăng nhập không được để trống' }
  if (name.length < USERNAME_MIN || name.length > USERNAME_MAX) {
    return { valid: false, error: `Tên đăng nhập phải từ ${USERNAME_MIN} đến ${USERNAME_MAX} ký tự` }
  }
  if (!USERNAME_REGEX.test(name)) {
    return { valid: false, error: 'Tên đăng nhập chỉ được chứa chữ, số, \'-\', \'.\' và \'_\'' }
  }

  if (typeof password !== 'string') return { valid: false, error: 'Mật khẩu không hợp lệ' }
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    return { valid: false, error: `Mật khẩu phải từ ${PASSWORD_MIN} đến ${PASSWORD_MAX} ký tự` }
  }
  // must contain at least one letter and one digit
  const hasLetter = /[A-Za-z]/.test(password)
  const hasNumber = /\d/.test(password)
  if (!hasLetter || !hasNumber) {
    return { valid: false, error: 'Mật khẩu phải chứa cả chữ và số' }
  }

  if (typeof confirm !== 'string' || password !== confirm) return { valid: false, error: 'Mật khẩu xác nhận không khớp' }

  return { valid: true }
}

export function markRegisterSuccess() {
  localStorage.setItem('registerSuccess', 'true')
}
