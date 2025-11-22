export const validateUsername = (username: string): string => {
  if (!username) {
    return 'Tên đăng nhập không được để trống';
  }
  if (username.length < 3) {
    return 'Tên đăng nhập phải có ít nhất 3 ký tự';
  }
  if (username.length > 50) {
    return 'Tên đăng nhập không được vượt quá 50 ký tự';
  }
  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    return 'Tên đăng nhập chỉ được chứa chữ cái và số';
  }
  return '';
};

export const validatePassword = (password: string): string => {
  if (!password) {
    return 'Mật khẩu không được để trống';
  }
  if (password.length < 6) {
    return 'Mật khẩu phải có ít nhất 6 ký tự';
  }
  if (password.length > 100) {
    return 'Mật khẩu không được vượt quá 100 ký tự';
  }
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    return 'Mật khẩu phải chứa cả chữ và số';
  }
  return '';
};
