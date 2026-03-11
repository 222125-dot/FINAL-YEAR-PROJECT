import axios from 'axios'

// Allow overriding API base URL via Vite env var `VITE_API_URL`.
// Example: set VITE_API_URL=https://api.example.com in Vercel env.
const resolvedBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : ''
const api = axios.create({
  baseURL: resolvedBase || '/api',
  timeout: 60000, // 60s for ML inference
})

// Auto-attach JWT
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('v3d_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Auto-logout on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('v3d_token')
      localStorage.removeItem('v3d_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ── Auth ──────────────────────────────────────────
export const authAPI = {
  login:   (data) => api.post('/auth/login',  data),
  signup:  (data) => api.post('/auth/signup', data),
  me:      ()     => api.get('/auth/me'),
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

