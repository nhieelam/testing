// Simple auth helper to centralize localStorage access and emit events
export function setAuth(token: string, username?: string) {
  localStorage.setItem('token', token)
  if (username) {
    localStorage.setItem('username', username)
  }
  localStorage.setItem('isAuthenticated', 'true')
  try {
    window.dispatchEvent(new CustomEvent('authChanged'))
  } catch (e) {
    // ignore
  }
}

export function clearAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('isAuthenticated')
  try {
    window.dispatchEvent(new CustomEvent('authChanged'))
  } catch (e) {}
}

export function getToken(): string | null {
  return localStorage.getItem('token')
}

export function getUsername(): string | null {
  return localStorage.getItem('username')
}

export function isAuthenticated(): boolean {
  return localStorage.getItem('isAuthenticated') === 'true'
}
