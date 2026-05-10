import axios from 'axios'
import { supabase } from './supabaseClient'

// Allow overriding API base URL via Vite env var `VITE_API_URL`.
// Example: set VITE_API_URL=https://api.example.com in Vercel env.
const resolvedBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : ''
const apiBase = resolvedBase
  ? (resolvedBase.endsWith('/api') ? resolvedBase : `${resolvedBase}/api`)
  : '/api'
const api = axios.create({
  baseURL: apiBase,
  timeout: 10000, // 10s timeout (reduced from 60s for faster failure)
})

function isAuthMeRequest(config) {
  const url = config?.url ?? ''
  return typeof url === 'string' && url.includes('auth/me')
}

async function logoutAndRedirectOn401(err, config) {
  if (err.response?.status !== 401) return
  // Let Login / AuthContext handle profile failures so the user sees the real error
  if (isAuthMeRequest(config)) return
  await supabase.auth.signOut()
  window.location.href = '/login'
}

// Attach Supabase access_token per request
api.interceptors.request.use(async (cfg) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    cfg.headers.Authorization = `Bearer ${session.access_token}`
  }
  return cfg
})

// RELIABILITY: Auto-retry on network failure (max 2 retries with exponential backoff)
api.interceptors.response.use(
  res => res,
  async err => {
    const config = err.config
    // Only retry on network errors or 5xx, not on 4xx client errors
    if (!config || config._retryCount >= 2) {
      await logoutAndRedirectOn401(err, config)
      return Promise.reject(err)
    }
    const isRetryable = !err.response || (err.response.status >= 500 && err.response.status !== 501)
    if (!isRetryable) {
      await logoutAndRedirectOn401(err, config)
      return Promise.reject(err)
    }
    config._retryCount = (config._retryCount || 0) + 1
    const delay = config._retryCount * 1000 // 1s, 2s
    await new Promise(r => setTimeout(r, delay))
    return api(config)
  }
)

export default api

// ── Auth ──────────────────────────────────────────
export const authAPI = {
  me: (config = {}) => api.get('/auth/me', config),
}

// ── Analyze ──────────────────────────────────────
export const analyzeAPI = {
  scan: (formData) => api.post('/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  }),
}

// ── Reports ──────────────────────────────────────
export const reportsAPI = {
  list:   ()   => api.get('/reports/'),
  get:    (id) => api.get(`/reports/${id}`),
  delete: (id) => api.delete(`/reports/${id}`),
}

// ── Text to 3D ────────────────────────────────────
export const text3dAPI = {
  generate: (data) => api.post('/text3d/generate', data),
}

// ── Queries ─────────────────────────────────────
export const queriesAPI = {
  create: (data) => api.post('/queries/', data),
  list:   () => api.get('/queries/'),
}
