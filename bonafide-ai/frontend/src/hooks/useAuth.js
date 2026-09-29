import { useState, useEffect, useCallback } from 'react'

export function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(() => localStorage.getItem('token'))

  const isAuthenticated = !!token && !!user
  const isAdmin = isAuthenticated && user?.role === 'admin'

  const login = useCallback((userData, userToken) => {
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', userToken)
    setUser(userData)
    setToken(userToken)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    setToken(null)
  }, [])

  const updateUser = useCallback((userData) => {
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }, [])

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'token') {
        setToken(e.newValue)
      }
      if (e.key === 'user') {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null)
        } catch {
          setUser(null)
        }
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return { user, token, login, logout, updateUser, isAuthenticated, isAdmin }
}
