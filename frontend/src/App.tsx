import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'

function Home() {
  return (
    <div>
      <h1>Trang chủ</h1>
      <p className="read-the-docs">hello mọi người</p>
      <p>
        <Link to="/login">Đến trang đăng nhập</Link>
      </p>
    </div>
  )
}

function NavBar() {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  // use auth helper to read storage
  useEffect(() => {
    try {
      const t = localStorage.getItem('token')
      const u = localStorage.getItem('username')
      setToken(t)
      setUsername(u)
    } catch (e) {
      setToken(null)
      setUsername(null)
    }
  }, [])

  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === 'token' || e.key === 'username' || e.key === 'isAuthenticated') {
        setToken(localStorage.getItem('token'))
        setUsername(localStorage.getItem('username'))
      }
    }

    function handleAuthChanged() {
      setToken(localStorage.getItem('token'))
      setUsername(localStorage.getItem('username'))
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('authChanged', handleAuthChanged)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('authChanged', handleAuthChanged)
    }
  }, [])

  function handleLogout() {
    // centralized logout
    // use dynamic import to clear auth (avoids circular static imports)
    import('./utils/auth')
      .then((auth) => {
        if (auth && typeof auth.clearAuth === 'function') {
          auth.clearAuth()
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('username')
          localStorage.removeItem('isAuthenticated')
          try {
            window.dispatchEvent(new CustomEvent('authChanged'))
          } catch (e) {}
        }
      })
      .catch(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('isAuthenticated')
        try {
          window.dispatchEvent(new CustomEvent('authChanged'))
        } catch (e) {}
      })
    setToken(null)
    setUsername(null)
    navigate('/login')
  }

  return (
    <nav className="p-4 bg-gray-800 text-white flex justify-between items-center">
      <div className="space-x-4">
        {token ? (
          <>
            <span>Xin chào{username ? `, ${username}` : ''}</span>
            <button onClick={handleLogout} className="ml-3 underline">
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="underline">
              Đăng nhập
            </Link>
            <Link to="/register" className="underline">
              Đăng kí
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <div className="container mx-auto p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
