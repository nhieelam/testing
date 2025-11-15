import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API_BASE_URL = 'http://localhost:8080'

export default function Register() {
	const [username, setUsername] = useState<string>('')
	const [password, setPassword] = useState<string>('')
	const [confirm, setConfirm] = useState<string>('')
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)
	const navigate = useNavigate()

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setError(null)

		if (password.length < 6) {
			setError('Mật khẩu phải có ít nhất 6 ký tự')
			return
		}
		if (password !== confirm) {
			setError('Mật khẩu xác nhận không khớp')
			return
		}

		setLoading(true)
		try {
			const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username: username, password: password }),
			})

			if (res.ok) {
				// mark success so Login can show a message
				localStorage.setItem('registerSuccess', 'true')
				navigate('/login')
			} else {
				const text = await res.text()
				setError(text || 'Đăng kí thất bại')
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
			<h2 className="text-2xl font-semibold mb-4">Đăng kí</h2>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block text-sm font-medium mb-2">Tên đăng nhập</label>
					<input
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
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
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-2">Xác nhận mật khẩu</label>
					<input
						type="password"
						value={confirm}
						onChange={(e) => setConfirm(e.target.value)}
						required
						className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/90 text-black"
					/>
				</div>

				{error && <div className="text-red-600 text-sm">{error}</div>}

				<div className="flex items-center gap-3">
					<button
						type="submit"
						disabled={loading}
						className="px-4 py-2 bg-green-600 text-black rounded-md hover:bg-green-700 disabled:opacity-60"
					>
						{loading ? 'Đang gửi...' : 'Đăng kí'}
					</button>
					<Link to="/login" className="text-sm text-gray-400 hover:text-gray-200">
						Đã có tài khoản? Đăng nhập
					</Link>
				</div>
			</form>
		</div>
	)
}
