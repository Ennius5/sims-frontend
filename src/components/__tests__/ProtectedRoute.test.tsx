import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '../ProtectedRoute'
import { useAuth } from '../../hooks/useAuth'

vi.mock('../../hooks/useAuth')

function renderWithRoute(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Dashboard Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  it('shows a loading state while the auth check is in progress', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: true,
      login: vi.fn(),
      logout: vi.fn(),
    })

    renderWithRoute('/dashboard')

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    expect(screen.queryByText(/dashboard content/i)).not.toBeInTheDocument()
  })

  it('redirects to /login when there is no authenticated user', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    })

    renderWithRoute('/dashboard')

    expect(screen.getByText(/login page/i)).toBeInTheDocument()
    expect(screen.queryByText(/dashboard content/i)).not.toBeInTheDocument()
  })

  it('renders the protected content when a user is authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, name: 'Admin', email: 'admin@sims.test', roles: ['administrator'] },
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    })

    renderWithRoute('/dashboard')

    expect(screen.getByText(/dashboard content/i)).toBeInTheDocument()
  })
})