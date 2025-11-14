import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Placeholder: perform auth here. For now just navigate to home.
    console.log('login', { email, password })
    navigate('/')
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 20 }}>
      <h2>Đăng nhập</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="submit" style={{ padding: '8px 14px' }}>
            Đăng nhập
          </button>
          <Link to="/">Hủy</Link>
        </div>
      </form>
    </div>
  )
}
