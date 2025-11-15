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
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data && data.token) {
          setAuth(data.token, data.username)
        }
        localStorage.removeItem('registerSuccess')
        navigate('/products')
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
    <div className="min-h-screen flex items-center justify-center  from-slate-900 via-slate-950 to-slate-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Đăng nhập tài khoản
          </h1>
        </div>

        {/* Card Container */}
        <div className="bg-blue-900 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl px-6 py-7 space-y-5">
          {/* Info / Success */}
          {info && (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-200">
              <span className="mt-0.5 text-lg">✔</span>
              <span>{info}</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-2.5 text-sm text-red-200">
              <span className="mt-0.5 text-lg">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className=" block text-sm font-medium text-slate-200">
                Email
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                // autoComplete="email"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/60"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-200">
                  Mật khẩu
                </label>
  
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/60"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="pt-2 space-y-2 text-center">
            <p className="text-xs text-slate-400">
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="font-medium text-blue-400 hover:text-blue-300"
              >
                Đăng ký ngay
              </Link>
            </p>
            <Link
              to="/"
              className=" inline-flex items-center justify-center text-xs text-slate-400 hover:text-slate-200"
            >
              <span className="mr-1  text-blue-400 hover:text-blue-300">Quay về trang chủ</span > 
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
