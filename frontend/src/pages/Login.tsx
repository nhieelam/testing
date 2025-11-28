import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { setAuth } from '../utils/auth'
import { login as apiLogin } from '../services/authService'
import { consumeRegisterSuccess, parseLoginError } from '../utils/loginUtils'
import { validateLoginForm } from '../utils/loginValidation'

export default function Login() {
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const navigate = useNavigate()

  useEffect(() => {
    const msg = consumeRegisterSuccess()
    if (msg) setInfo(msg)
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setUsernameError(null)
    setPasswordError(null)

    const { usernameError: uError, passwordError: pError } = validateLoginForm(
      username,
      password,
    )

    setUsernameError(uError)
    setPasswordError(pError)

    if (uError || pError) {
      return
    }

    setLoading(true)

    try {
      const data = await apiLogin(username, password)
      if (data && data.token) {
        setAuth(data.token, data.username)
      }
      localStorage.removeItem('registerSuccess')
      navigate('/products')
    } catch (err: any) {
      console.error(err)
      setError(parseLoginError(err))
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

        <div className="bg-blue-900 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl px-6 py-7 space-y-5">
          {info && (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-200">
              <span className="mt-0.5 text-lg">✔</span>
              <span>{info}</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="flex items-start gap-2 rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-2.5 text-sm text-red-200"
              data-text="login-error"
            >
              <span className="mt-0.5 text-lg">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className=" block text-sm font-medium text-slate-200">
                tên đăng nhập
              </label>
              <input
                type="text"
                data-text="login-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tên đăng nhập"
                // autoComplete="username"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/60"
              />
              {usernameError && (
                <p
                  data-text="login-username-error"
                  className="mt-1 text-xs text-red-300"
                >
                  {usernameError}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-200">
                  Mật khẩu
                </label>
  
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  data-text="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/60"
                  placeholder="••••••••"
                />
                <p
                  data-text="toggle-password"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs cursor-pointer text-black px-2 py-1 rounded"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </p>
              </div>
              {passwordError && (
                <p
                  data-text="login-password-error"
                  className="mt-1 text-xs text-red-300"
                >
                  {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              data-text="login-submit"
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
