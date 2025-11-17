const API_BASE_URL = 'http://localhost:8080'

export interface LoginResponse {
  token: string
  userId: string
  username: string
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (!res.ok) {
    if (res.status === 401) throw new Error('Unauthorized')
    const text = await res.text().catch(() => '')
    throw new Error(text || 'Login failed')
  }

  const data = await res.json()
  return data as LoginResponse
}

export async function register(username: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  const text = await res.text()
  if (!res.ok) throw new Error(text || 'Register failed')
  return text
}
