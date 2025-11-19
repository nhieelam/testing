import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom' 
import Login from './Login'
import * as authService from '../services/authService'

const mockedApiLogin = vi.spyOn(authService, 'login')

const mockedNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal: any) => {
  const actual = (await importOriginal()) as typeof import('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  }
})

describe('Login Component Mock Tests', () => {
  beforeEach(() => {
    mockedApiLogin.mockClear()
    mockedNavigate.mockClear()
  })

  //
  test('TC1: Mock - Đăng nhập thành công', async () => {
    const mockResponse = {
      token: 'mock-token-123',
      userId: 'user-id-1',
      username: 'testuser',
    }
    mockedApiLogin.mockResolvedValue(mockResponse)

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByTestId('login-username'), {
      target: { value: 'testuser' },
    })
    fireEvent.change(screen.getByTestId('login-password'), {
      target: { value: 'Password123' }, 
    })
    fireEvent.click(screen.getByTestId('login-submit'))

    await waitFor(() => {
      expect(mockedApiLogin).toHaveBeenCalledWith('testuser', 'Password123')
    })

    expect(mockedNavigate).toHaveBeenCalledWith('/products')
  })

  test('TC2: Mock - Đăng nhập thất bại (sai credentials)', async () => {
    const mockError = new Error('Invalid username or password')
    mockedApiLogin.mockRejectedValue(mockError)

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByTestId('login-username'), {
      target: { value: 'testuser' },
    })
    fireEvent.change(screen.getByTestId('login-password'), {
      target: { value: 'wrongpass123' }, 
    })
    fireEvent.click(screen.getByTestId('login-submit'))

    await waitFor(() => {
      expect(mockedApiLogin).toHaveBeenCalledWith('testuser', 'wrongpass123')
    })

    expect(mockedNavigate).not.toHaveBeenCalled()


    const errorElement = await screen.findByTestId('login-error')
    expect(errorElement).toBeInTheDocument()
    expect(errorElement).toHaveTextContent('Invalid username or password')
  })
})