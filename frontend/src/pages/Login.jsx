import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'
import { useToast } from '../utils/ToastContext'

export default function Login() {
  const [tab, setTab]   = useState('login')
  const [form, setForm] = useState({ username:'', email:'', password:'', full_name:'' })
  const [busy, setBusy] = useState(false)
  const [err,  setErr]  = useState('')
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const toast    = useToast()

  const set = (k, v) => { setForm(f=>({...f,[k]:v})); setErr('') }

  const doLogin = async () => {
    setErr('')
    if (!form.username.trim()) { setErr('Username is required'); return }
    if (!form.password)        { setErr('Password is required'); return }
    setBusy(true)
    try {
      await login(form.username.trim(), form.password)
      toast('Welcome back! 👋')
      navigate('/')
    } catch (e) {
      const msg = e.response?.data?.detail || e.message || 'Login failed'
      setErr(msg)
    } finally { setBusy(false) }
  }

  const doSignup = async () => {
    setErr('')
    if (!form.full_name.trim()) { setErr('Full name is required'); return }
    if (!form.username.trim())  { setErr('Username is required'); return }
    if (form.username.trim().length < 3) { setErr('Username must be at least 3 characters'); return }
    if (!form.email.trim() || !form.email.includes('@')) { setErr('Valid email is required'); return }
    if (!form.password || form.password.length < 4) { setErr('Password must be at least 4 characters'); return }
    setBusy(true)
    try {
      await signup({
        username:  form.username.trim(),
        email:     form.email.trim(),
        password:  form.password,
        full_name: form.full_name.trim(),
      })
      toast('Account created! Welcome to Visio3D 🎉')
      navigate('/')
    } catch (e) {
      const msg = e.response?.data?.detail || e.message || 'Signup failed'
      setErr(msg)
    } finally { setBusy(false) }
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'radial-gradient(ellipse 80% 60% at 50% -10%,rgba(0,200,83,.15) 0%,transparent 70%),var(--dark)',
      padding:'1rem',
    }}>
      <div style={{
        width:'100%', maxWidth:440,
        background:'rgba(4,26,10,.85)',
        border:'1px solid var(--border)', borderRadius:24, padding:'2.5rem',
        backdropFilter:'blur(30px)',
        boxShadow:'0 40px 80px rgba(0,0,0,.5)',
      }}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'2rem',fontWeight:800,background:'linear-gradient(135deg,var(--g1),var(--g2))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:'.2rem'}}>
          Visio3D
        </div>
        <p style={{fontSize:'.85rem',color:'var(--muted)',marginBottom:'2rem'}}>
          AI-powered 3D medical visualization
        </p>

        {/* Tab switch */}
        <div style={{display:'flex',gap:'.5rem',background:'rgba(0,255,136,.04)',border:'1px solid var(--border)',borderRadius:10,padding:'.3rem',marginBottom:'1.5rem'}}>
          {['login','signup'].map(t=>(
            <button key={t} onClick={()=>{setTab(t);setErr('')}} style={{
              flex:1,padding:'.5rem',border:'none',borderRadius:7,
              background:tab===t?'linear-gradient(135deg,var(--g3),var(--g1))':'transparent',
              color:tab===t?'#020c06':'var(--muted)',
              cursor:'pointer',fontSize:'.85rem',fontWeight:tab===t?700:500,
              fontFamily:"'DM Sans',sans-serif",transition:'all .2s',
            }}>
              {t==='login'?'Sign In':'Create Account'}
            </button>
          ))}
        </div>

        {/* Error box */}
        {err && (
          <div style={{
            background:'rgba(255,68,68,.1)',border:'1px solid rgba(255,68,68,.3)',
            borderRadius:8,padding:'.7rem 1rem',marginBottom:'1rem',
            fontSize:'.83rem',color:'#ff6666',display:'flex',alignItems:'center',gap:'.5rem',
          }}>
            <span>⚠️</span> {err}
          </div>
        )}

        {tab==='login' ? (
          <div className="fade-in">
            <div className="form-group">
              <label>Username</label>
              <input value={form.username} onChange={e=>set('username',e.target.value)}
                placeholder="your_username" onKeyDown={e=>e.key==='Enter'&&doLogin()} autoFocus/>
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={form.password} onChange={e=>set('password',e.target.value)}
                placeholder="••••••••" onKeyDown={e=>e.key==='Enter'&&doLogin()}/>
            </div>
            <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',marginTop:'.5rem'}}
              onClick={doLogin} disabled={busy}>
              {busy?<><span style={{width:16,height:16,border:'2px solid rgba(0,0,0,.3)',borderTopColor:'#020c06',borderRadius:'50%',display:'inline-block',animation:'spin 1s linear infinite'}}/> Signing in...</>:'Sign In →'}
            </button>
            <p style={{fontSize:'.78rem',color:'var(--muted)',textAlign:'center',marginTop:'1rem'}}>
              No account?{' '}
              <span style={{color:'var(--g1)',cursor:'pointer'}} onClick={()=>{setTab('signup');setErr('')}}>Create one here</span>
            </p>
          </div>
        ):(
          <div className="fade-in">
            <div className="form-group">
              <label>Full Name</label>
              <input value={form.full_name} onChange={e=>set('full_name',e.target.value)} placeholder="Dr. Ahmed Khan" autoFocus/>
            </div>
            <div className="form-group">
              <label>Username</label>
              <input value={form.username} onChange={e=>set('username',e.target.value)} placeholder="dr_ahmed (min 3 chars)"/>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="doctor@hospital.com"/>
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={form.password} onChange={e=>set('password',e.target.value)}
                placeholder="Min 4 characters" onKeyDown={e=>e.key==='Enter'&&doSignup()}/>
            </div>
            <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',marginTop:'.5rem'}}
              onClick={doSignup} disabled={busy}>
              {busy?<><span style={{width:16,height:16,border:'2px solid rgba(0,0,0,.3)',borderTopColor:'#020c06',borderRadius:'50%',display:'inline-block',animation:'spin 1s linear infinite'}}/> Creating...</>:'Create Account →'}
            </button>
            <p style={{fontSize:'.78rem',color:'var(--muted)',textAlign:'center',marginTop:'1rem'}}>
              Already have account?{' '}
              <span style={{color:'var(--g1)',cursor:'pointer'}} onClick={()=>{setTab('login');setErr('')}}>Sign in here</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
