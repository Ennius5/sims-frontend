import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AxiosError } from 'axios'
import { AuthProvider } from '../../context/AuthContext'
import LoginPage from '../LoginPage'
import { apiClient } from '../../services/apiClient'

vi.mock('../../services/apiClient')

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('logs in successfully and stores the token', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { user: { id: 1, name: 'Admin', email: 'admin@sims.test', roles: ['administrator'] }, token: 'fake-token' },
    })

    renderLoginPage()

    await user.type(screen.getByLabelText(/email/i), 'admin@sims.test')
    await user.type(screen.getByLabelText(/password/i), 'password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(localStorage.getItem('sims_token')).toBe('fake-token')
    })
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'admin@sims.test',
      password: 'password',
    })
  })

  it('shows a field error on invalid credentials', async () => {
    const user = userEvent.setup()
    const error = new AxiosError('Validation failed')
    error.response = {
      status: 422,
      data: { success: false, message: 'Validation failed.', errors: { email: ['The provided credentials are incorrect.'] } },
      statusText: 'Unprocessable Content',
      headers: {},
      config: {} as never,
    }
    vi.mocked(apiClient.post).mockRejectedValueOnce(error)

    renderLoginPage()

    await user.type(screen.getByLabelText(/email/i), 'admin@sims.test')
    await user.type(screen.getByLabelText(/password/i), 'wrong-password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/provided credentials are incorrect/i)).toBeInTheDocument()
    expect(localStorage.getItem('sims_token')).toBeNull()
  })
})