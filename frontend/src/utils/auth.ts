export function setAuth(token: string, username?: string) {
  sessionStorage.setItem('token', token)
  if (username) {
    sessionStorage.setItem('username', username)
  }
  sessionStorage.setItem('isAuthenticated', 'true')
  try {
    window.dispatchEvent(new CustomEvent('authChanged'))
  } catch (e) {
    // ignore
  }
}

export function clearAuth() {
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('username')
  sessionStorage.removeItem('isAuthenticated')
  try {
    window.dispatchEvent(new CustomEvent('authChanged'))
  } catch (e) {}
}

export function getToken(): string | null {
  return sessionStorage.getItem('token')
}

export function getUsername(): string | null {
  return sessionStorage.getItem('username')
}

export function isAuthenticated(): boolean {
  return sessionStorage.getItem('isAuthenticated') === 'true'
}
