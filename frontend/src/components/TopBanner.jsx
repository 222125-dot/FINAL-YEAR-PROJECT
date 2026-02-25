import React from 'react'

export default function TopBanner() {
  return (
    <div style={{
      background: 'linear-gradient(135deg,rgba(0,200,83,.15),rgba(0,229,255,.1))',
      borderBottom: '1px solid rgba(0,255,136,.15)',
      padding: '.5rem 2rem',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.7rem',
      fontSize: '.78rem', color: 'var(--info)',
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 101,
    }}>
      <span>✨</span>
      <span>Visio3D Beta — YOLO-powered kidney analysis with real 3D mesh</span>
      <span className="badge badge-green">LIVE</span>
    </div>
  )
}
