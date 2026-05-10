import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from './api'
import { supabase } from './supabaseClient'

const AuthContext = createContext(null)

function axiosDetail(err) {
  const d = err.response?.data?.detail
  if (typeof d === 'string') return d
  if (Array.isArray(d)) return d.map(x => (typeof x === 'object' && x?.msg ? x.msg : String(x))).join(' ')
  if (d != null && typeof d === 'object') return JSON.stringify(d)
  return err.message || String(err)
}

async function loadProfile() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8s timeout
    const res = await authAPI.me({ signal: controller.signal })
    clearTimeout(timeoutId)
    return res.data
  } catch (err) {
    // Don't throw - just return null so page still loads
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session || cancelled) {
          setLoading(false) // Don't wait for API if no session
          return
        }
        const profile = await loadProfile()
        if (!cancelled) setUser(profile)
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    bootstrap()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        if (!cancelled) {
          setUser(null)
          setLoading(false)
        }
        return
      }
      try {
        const profile = await loadProfile()
        if (!cancelled) setUser(profile)
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    try {
      const profile = await loadProfile()
      setUser(profile)
      return profile
    } catch (e) {
      await supabase.auth.signOut()
      throw new Error(axiosDetail(e))
    }
  }

  const signup = async ({ username, email, password, full_name }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, full_name },
      },
    })
    if (error) throw error
    if (!data.session) {
      const msg =
        'Account created. If email confirmation is enabled, check your inbox before signing in.'
      throw new Error(msg)
    }
    try {
      const profile = await loadProfile()
      setUser(profile)
      return profile
    } catch (e) {
      await supabase.auth.signOut()
      throw new Error(axiosDetail(e))
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
