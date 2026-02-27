import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './utils/AuthContext'
import { ToastProvider } from './utils/ToastContext'

import Navbar from './components/Navbar'
import TopBanner from './components/TopBanner'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Reports from './pages/Reports'
import Insights from './pages/Insights'
import TextTo3D from './pages/TextTo3D'
import Compare from './pages/Compare'
import Pricing from './pages/Pricing'
import Login from './pages/Login'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppLayout() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  return (
    <>
      <TopBanner />
      <Navbar />
      <Routes>
        <Route path="/"         element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/upload"   element={<ProtectedRoute><Upload /></ProtectedRoute>} />
        <Route path="/reports"  element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
        <Route path="/text3d"   element={<ProtectedRoute><TextTo3D /></ProtectedRoute>} />
        <Route path="/compare"  element={<ProtectedRoute><Compare /></ProtectedRoute>} />
        <Route path="/pricing"  element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
