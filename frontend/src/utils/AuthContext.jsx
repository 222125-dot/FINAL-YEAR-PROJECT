import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // For demo, always logged in
    const dummyUser = {
      id: 1,
      username: 'demo',
      email: 'demo@example.com',
      full_name: 'Demo User',
      plan: 'free',
      created_at: new Date().toISOString()
    }
    const dummyToken = 'demo-token'
    localStorage.setItem('v3d_token', dummyToken)
    localStorage.setItem('v3d_user', JSON.stringify(dummyUser))
    setUser(dummyUser)
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const res = await authAPI.login({ username, password })
    localStorage.setItem('v3d_token', res.data.access_token)
    localStorage.setItem('v3d_user',  JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data
  }

  const signup = async (data) => {
    const res = await authAPI.signup(data)
    localStorage.setItem('v3d_token', res.data.access_token)
    localStorage.setItem('v3d_user',  JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('v3d_token')
    localStorage.removeItem('v3d_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
