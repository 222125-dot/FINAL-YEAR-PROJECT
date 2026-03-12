import React, { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './utils/AuthContext'
import { ToastProvider } from './utils/ToastContext'

import Navbar from './components/Navbar'
import TopBanner from './components/TopBanner'

// PERFORMANCE: Lazy-load page components (code splitting — smaller initial bundle)
const Home     = lazy(() => import('./pages/Home'))
const Upload   = lazy(() => import('./pages/Upload'))
const Reports  = lazy(() => import('./pages/Reports'))
const Insights = lazy(() => import('./pages/Insights'))
const TextTo3D = lazy(() => import('./pages/TextTo3D'))
const Compare  = lazy(() => import('./pages/Compare'))
const Pricing  = lazy(() => import('./pages/Pricing'))
const About    = lazy(() => import('./pages/About'))
const Login    = lazy(() => import('./pages/Login'))

// RELIABILITY: Error Boundary — catches render errors, shows fallback instead of crash
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('Visio3D Error Boundary caught:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
          flexDirection:'column', gap:'1rem', background:'var(--dark)', color:'var(--text)',
          padding:'2rem', textAlign:'center'
        }}>
          <div style={{ fontSize:'3rem' }}>⚠️</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif" }}>Something went wrong</h2>
          <p style={{ color:'var(--muted)', maxWidth:400 }}>
            An unexpected error occurred. Please refresh the page or try again.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => { this.setState({ hasError: false }); window.location.href = '/' }}
          >Reload Application</button>
        </div>
      )
    }
    return this.props.children
  }
}

// USABILITY: Loading fallback for lazy components
function PageLoader() {
  return (
    <div style={{
      minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center',
      flexDirection:'column', gap:'1rem'
    }}>
      <div className="spin" style={{
        width:36, height:36, border:'3px solid var(--border)',
        borderTopColor:'var(--g1)', borderRadius:'50%'
      }}/>
      <span style={{ color:'var(--muted)', fontSize:'.85rem' }}>Loading...</span>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
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
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"         element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/upload"   element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/reports"  element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
          <Route path="/text3d"   element={<ProtectedRoute><TextTo3D /></ProtectedRoute>} />
          <Route path="/compare"  element={<ProtectedRoute><Compare /></ProtectedRoute>} />
          <Route path="/pricing"  element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
          <Route path="/about"    element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="*"         element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/*" element={<AppLayout />} />
              </Routes>
            </Suspense>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
