import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import { clearAuth, getToken, getUsername } from './utils/auth'

function Home() {
  const [token, setToken] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    // Lấy token + username từ storage khi load trang
    setToken(getToken())
    setUsername(getUsername())
  }, [])

  useEffect(() => {
    // Cập nhật khi auth thay đổi ở tab khác hoặc cùng tab (custom event)
    function handleStorage(e: StorageEvent) {
      if (e.key === 'token' || e.key === 'username' || e.key === 'isAuthenticated') {
        setToken(getToken())
        setUsername(getUsername())
      }
    }

    function handleAuthChanged() {
      setToken(getToken())
      setUsername(getUsername())
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('authChanged', handleAuthChanged)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('authChanged', handleAuthChanged)
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-8 text-center space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Trang chủ</h1>
        <p className="text-sm text-slate-500">
          Chào mừng bạn đến với ứng dụng quản lý sản phẩm
          {username ? `, ${username}` : ''}
        </p>

        {/* Chỉ hiện Đăng nhập / Đăng ký khi CHƯA đăng nhập */}
        {!token && (
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Đăng ký
            </Link>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-200">
          {token ? (
            <>
              <p className="text-xs text-slate-400 mb-2">
                Bấm để xem sản phẩm:
              </p>
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                Xem danh sách sản phẩm
              </Link>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-500">
                Hãy đăng nhập
              </p>
            </>
          )}
        </div>

      </div>
    </div>
  )
}


function NavBar() {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    setToken(getToken())
    setUsername(getUsername())
  }, [])

  useEffect(() => {
    // Handle storage events from other tabs/windows (sessionStorage events work across tabs)
    function handleStorage(e: StorageEvent) {
      if (e.key === 'token' || e.key === 'username' || e.key === 'isAuthenticated') {
        setToken(getToken())
        setUsername(getUsername())
      }
    }

    // Handle auth changes in the same window (via custom event)
    function handleAuthChanged() {
      setToken(getToken())
      setUsername(getUsername())
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('authChanged', handleAuthChanged)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('authChanged', handleAuthChanged)
    }
  }, [])

  function handleLogout() {
    clearAuth()
    setToken(null)
    setUsername(null)
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          to="/"
          className="text-base font-semibold text-slate-900 hover:text-blue-600 transition-colors"
        >
          Quản lý sản phẩm
        </Link>

        <div className="flex items-center gap-4">
          {token ? (
            <>
              <Link
                to="/products"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Sản phẩm
              </Link>
              <span className="text-sm text-slate-600">
                Xin chào{username ? `, ${username}` : ''}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<Products />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
