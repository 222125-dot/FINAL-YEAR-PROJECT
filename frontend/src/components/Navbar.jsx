import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const doLogout = async () => {
    await logout()
    navigate('/login')
  }

  const linkStyle = ({ isActive }) => ({
    padding: '.4rem .9rem',
    fontSize: '.82rem', fontWeight: 500,
    color: isActive ? 'var(--g1)' : 'var(--muted)',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all .2s',
    border: isActive ? '1px solid var(--border)' : '1px solid transparent',
    background: isActive ? 'rgba(0,255,136,0.07)' : 'transparent',
    textDecoration: 'none',
  })

  return (
    <nav style={{
      position: 'fixed', top: 36, left: 0, right: 0,
      background: 'rgba(2,12,6,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      zIndex: 100, padding: '0 2rem', height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }} role="navigation" aria-label="Main navigation">
      {/* Logo */}
      <NavLink to="/" style={{ textDecoration:'none' }}>
        <span style={{
          fontFamily: "'Syne',sans-serif", fontSize: '1.4rem', fontWeight: 800,
          background: 'linear-gradient(135deg,var(--g1),var(--g2))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Visio3D</span>
      </NavLink>

      {/* Links */}
      <div style={{ display:'flex', gap:'.2rem', alignItems:'center', flexWrap:'wrap' }}>
        <NavLink to="/"         style={linkStyle}>Home</NavLink>
        <NavLink to="/upload"   style={linkStyle}>Upload</NavLink>
        <NavLink to="/reports"  style={linkStyle}>Reports</NavLink>
        <NavLink to="/insights" style={linkStyle}>Insights</NavLink>
        <NavLink to="/text3d"   style={linkStyle}>Text to 3D</NavLink>
        <NavLink to="/compare"  style={linkStyle}>Compare</NavLink>
        <NavLink to="/pricing"  style={linkStyle}>Pricing</NavLink>
        <NavLink to="/about"    style={linkStyle}>About</NavLink>
      </div>

      {/* Right */}
      <div style={{ display:'flex', gap:'.7rem', alignItems:'center' }}>
        <button 
          onClick={toggleTheme}
          style={{
            width:32, height:32, borderRadius:'50%',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', transition:'all .2s',
            color: 'var(--text)',
            fontSize: '1.2rem'
          }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        
        {/* Logout Button */}
        {user && (
          <button 
            onClick={doLogout}
            style={{
              padding: '.5rem 1.2rem',
              background: 'rgba(0,255,136,0.1)',
              color: 'var(--g1)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '.82rem', fontWeight: 500,
              cursor: 'pointer', transition: 'all .2s',
            }}
            onMouseOver={e => {
              e.target.style.background = 'rgba(0,255,136,0.15)'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseOut={e => {
              e.target.style.background = 'rgba(0,255,136,0.1)'
              e.target.style.transform = 'none'
            }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  )
}
