import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { setAuth } from '../utils/auth'

const API_BASE_URL = 'http://localhost:8080' // backend Spring Boot

export default function Login() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // show register success message if redirected from register
    const succ = localStorage.getItem('registerSuccess')
    if (succ === 'true') {
      setInfo('Đăng kí thành công. Vui lòng đăng nhập.')
      localStorage.removeItem('registerSuccess')
    }
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // backend expect: { username, password }
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      })

      if (res.ok) {
        // backend returns JSON { token, userId, username }
        const data = await res.json()
        if (data && data.token) {
          setAuth(data.token, data.username)
        }
        // clear any register info
        localStorage.removeItem('registerSuccess')
        navigate('/')
      } else if (res.status === 401) {
        setError('Sai email hoặc mật khẩu')
      } else {
        const text = await res.text()
        console.error('Login error:', text)
        setError('Có lỗi xảy ra, vui lòng thử lại')
      }
    } catch (err) {
      console.error(err)
      setError('Không kết nối được tới server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white/5 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Đăng nhập</h2>

      {info && <div className="text-green-600 mb-3">{info}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/90 text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/90 text-black"
            placeholder="••••••••"
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-black rounded-md hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
          <Link to="/" className="text-sm text-gray-400 hover:text-gray-200">
            quay về trang chủ
          </Link>
        </div>
      </form>
    </div>
  )
}

