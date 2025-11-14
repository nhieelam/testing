import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
