import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('v3d_token')
    const userData = localStorage.getItem('v3d_user')
    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        setUser(user)
      } catch (e) {
        // Invalid data, clear
        localStorage.removeItem('v3d_token')
        localStorage.removeItem('v3d_user')
      }
    }
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
