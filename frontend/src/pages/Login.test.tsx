import { render, screen, fireEvent, waitFor, configure } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import Login from './Login'
import { login } from '../services/authService'

configure({ testIdAttribute: 'data-text' })

vi.mock('../services/authService', () => ({
  login: vi.fn(),
}))

const mockedNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  }
})

describe('Login Component Mock Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('TC1: Mock - Đăng nhập thành công', async () => {
    const mockResponse = {
      token: 'mock-token-123',
      userId: 'user-id-1',
      username: 'testuser'
    }
    
    vi.mocked(login).mockResolvedValue(mockResponse as any)

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByTestId('login-username'), {
      target: { value: 'testuser' },
    })
    fireEvent.change(screen.getByTestId('login-password'), {
      target: { value: 'Password123' },
    })
    fireEvent.click(screen.getByTestId('login-submit'))

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('testuser', 'Password123')
    })

    expect(mockedNavigate).toHaveBeenCalledWith('/products')
  })

  test('TC2: Mock - Đăng nhập thất bại (sai credentials)', async () => {
    const mockError = new Error('Invalid username or password')
    
    vi.mocked(login).mockRejectedValue(mockError)

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByTestId('login-username'), {
      target: { value: 'testuser' },
    })
    fireEvent.change(screen.getByTestId('login-password'), {
      target: { value: 'wrongpass123' },
    })
    fireEvent.click(screen.getByTestId('login-submit'))

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('testuser', 'wrongpass123')
    })

    expect(mockedNavigate).not.toHaveBeenCalled()

    const errorElement = await screen.findByTestId('login-error')
    expect(errorElement).toBeInTheDocument()
  })
})