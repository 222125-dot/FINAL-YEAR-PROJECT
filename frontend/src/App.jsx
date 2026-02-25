import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './utils/AuthContext'
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
        <Route path="/"         element={<Home />} />
        <Route path="/upload"   element={<Upload />} />
        <Route path="/reports"  element={<Reports />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/text3d"   element={<TextTo3D />} />
        <Route path="/compare"  element={<Compare />} />
        <Route path="/pricing"  element={<Pricing />} />
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
          <AppLayout />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
