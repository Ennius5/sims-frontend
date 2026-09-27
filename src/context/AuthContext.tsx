import { createContext, useEffect, useState, type ReactNode } from 'react'
import type { User, LoginCredentials } from '../types/auth'
import * as authService from '../services/authService'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount: if we have a stored token, try to fetch the current user.
  useEffect(() => {
    const token = localStorage.getItem('sims_token')
    if (!token) {
      setIsLoading(false)
      return
    }

    authService
      .getCurrentUser()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('sims_token')
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  // Listen for the 401 event dispatched by apiClient's interceptor.
  useEffect(() => {
    function handleUnauthorized() {
      setUser(null)
    }
    window.addEventListener('sims:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('sims:unauthorized', handleUnauthorized)
  }, [])

  async function login(credentials: LoginCredentials) {
    const { user, token } = await authService.login(credentials)
    localStorage.setItem('sims_token', token)
    setUser(user)
  }

  async function logout() {
    try {
      await authService.logout()
    } finally {
      localStorage.removeItem('sims_token')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}