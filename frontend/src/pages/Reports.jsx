import React, { useState, useEffect, useMemo } from 'react'
import { reportsAPI } from '../utils/api'
import { useToast } from '../utils/ToastContext'
import ModelViewer from '../components/ModelViewer'

// ═══════════════════════════════════════════════════
//  ANALYTICS DASHBOARD (computed from real user data)
// ═══════════════════════════════════════════════════
function AnalyticsDashboard({ reports, hoveredStat, setHoveredStat }) {
  const stats = useMemo(() => {
    const total = reports.length
    const avgConf = total ? (reports.reduce((s,r) => s + (r.confidence||0), 0) / total).toFixed(1) : 0
    const totalDetections = reports.reduce((s,r) => s + (r.total_found||0), 0)

    // This week count
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7*24*60*60*1000)
    const thisWeek = reports.filter(r => r.date && new Date(r.date) >= weekAgo).length

    // Severity distribution
    const sevCounts = { Low:0, Moderate:0, High:0, Severe:0 }
    reports.forEach(r => { if(r.overall_severity && sevCounts[r.overall_severity] !== undefined) sevCounts[r.overall_severity]++ })
    const sevTotal = Object.values(sevCounts).reduce((a,b)=>a+b,0) || 1

    // Organ distribution
    const organCounts = {}
    reports.forEach(r => { organCounts[r.organ||'Unknown'] = (organCounts[r.organ||'Unknown']||0) + 1 })

    // Scan activity (last 7 days)
    const activity = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i*24*60*60*1000)
      const dateStr = d.toLocaleDateString('en-US',{month:'short',day:'numeric'})
      const count = reports.filter(r => {
        if(!r.date) return false
        const rd = new Date(r.date)
        return rd.toDateString() === d.toDateString()
      }).length
      activity.push({ date: dateStr, count })
    }
    const maxActivity = Math.max(...activity.map(a=>a.count), 1)

    // Top conditions
    const condCounts = {}
    reports.forEach(r => (r.detections||[]).forEach(d => {
      condCounts[d.label] = (condCounts[d.label]||0) + 1
    }))
    const topConditions = Object.entries(condCounts).sort((a,b)=>b[1]-a[1]).slice(0,5)

    // Avg analysis time
    const avgTime = total ? (reports.reduce((s,r)=>s+(r.analysis_time||0),0)/total).toFixed(1) : 0

    return { total, avgConf, totalDetections, thisWeek, sevCounts, sevTotal, organCounts, activity, maxActivity, topConditions, avgTime }
  }, [reports])

  const kpis = [
    { label:'Total Scans', val: stats.total, icon:'📊', color:'var(--g1)', bg:'rgba(0,255,136,.12)' },
    { label:'Avg Confidence', val: stats.avgConf+'%', icon:'🎯', color:'var(--g2)', bg:'rgba(0,229,255,.12)' },
    { label:'Conditions Found', val: stats.totalDetections, icon:'🔬', color:'#ff6600', bg:'rgba(255,102,0,.12)' },
    { label:'This Week', val: stats.thisWeek, icon:'📅', color:'#ff4444', bg:'rgba(255,68,68,.12)' },
    { label:'Avg Scan Time', val: stats.avgTime+'s', icon:'⚡', color:'#ffaa00', bg:'rgba(255,170,0,.12)' },
  ]

  const sevColors = { Low:'#00ff88', Moderate:'#ffaa00', High:'#ff6600', Severe:'#ff2222' }

  // SVG Pie chart for severity
  const sevEntries = Object.entries(stats.sevCounts).filter(([,v])=>v>0)
  let cumAngle = 0
  const pieSlices = sevEntries.map(([label, count]) => {
    const pct = count / stats.sevTotal
    const startAngle = cumAngle * 360
    const sliceAngle = pct * 360
    cumAngle += pct
    const start = polarToCartesian(80, 80, 70, startAngle)
    const end   = polarToCartesian(80, 80, 70, startAngle + sliceAngle)
    const large = sliceAngle > 180 ? 1 : 0
    const d = `M80,80 L${start.x},${start.y} A70,70 0 ${large},1 ${end.x},${end.y} Z`
    return { d, color: sevColors[label], label, pct: Math.round(pct*100) }
  })

  // SVG Line chart for activity
  const chartW = 300, chartH = 120, pad = 25
  const actPoints = stats.activity.map((a, i) => ({
    x: pad + i * ((chartW - 2*pad) / 6),
    y: chartH - pad - (a.count / stats.maxActivity) * (chartH - 2*pad),
    ...a
  }))
  const linePath = actPoints.map((p,i) => `${i===0?'M':'L'}${p.x},${p.y}`).join(' ')

  return (
    <div style={{ marginBottom:'2rem', animation:'fadeIn .5s ease-out' }}>

      {/* ── KPI STAT CARDS ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
        {kpis.map((k, i) => (
          <div
            key={k.label}
            onMouseEnter={() => setHoveredStat(i)}
            onMouseLeave={() => setHoveredStat(null)}
            style={{
              background: `linear-gradient(135deg, ${k.bg}, rgba(0,0,0,.2))`,
              border: `1px solid ${hoveredStat===i ? k.color : 'rgba(0,255,136,.12)'}`,
              borderRadius: 16, padding:'1.4rem 1.2rem',
              backdropFilter:'blur(15px)',
              transition:'all .4s cubic-bezier(0.23,1,0.320,1)',
              transform: hoveredStat===i ? 'translateY(-6px) scale(1.03)' : 'none',
              boxShadow: hoveredStat===i ? `0 20px 40px ${k.bg}` : '0 4px 15px rgba(0,0,0,.2)',
              cursor:'default', position:'relative', overflow:'hidden',
            }}
          >
            {hoveredStat===i && <div style={{
              position:'absolute', inset:0,
              background:`linear-gradient(135deg, transparent, ${k.bg}, transparent)`,
              animation:'shimmer 1s ease', pointerEvents:'none'
            }}/>}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.6rem', position:'relative', zIndex:1 }}>
              <span style={{ fontSize:'.72rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600 }}>{k.label}</span>
              <span style={{ fontSize:'1.3rem' }}>{k.icon}</span>
            </div>
            <div style={{
              fontFamily:"'Syne',sans-serif", fontSize:'2rem', fontWeight:800,
              color: k.color, position:'relative', zIndex:1, lineHeight:1
            }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.2rem', marginBottom:'1.5rem' }}>

        {/* Scan Activity Chart */}
        <div style={{
          background:'linear-gradient(135deg, rgba(0,255,136,.06), rgba(0,0,0,.3))',
          border:'1px solid rgba(0,255,136,.12)', borderRadius:20,
          padding:'1.5rem', backdropFilter:'blur(15px)',
          boxShadow:'0 10px 30px rgba(0,255,136,.05)'
        }}>
          <h3 style={{ margin:'0 0 1rem', fontSize:'1rem', fontWeight:700, display:'flex', alignItems:'center', gap:'.5rem' }}>
            <span>📈</span>
            <span style={{ background:'linear-gradient(135deg,var(--g1),var(--g2))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Scan Activity (Last 7 Days)
            </span>
          </h3>
          <svg viewBox={`0 0 ${chartW} ${chartH+15}`} style={{ width:'100%', height:'auto' }}>
            {/* Grid lines */}
            {[0,0.25,0.5,0.75,1].map(t => {
              const y = chartH - pad - t*(chartH-2*pad)
              return <line key={t} x1={pad} x2={chartW-pad} y1={y} y2={y} stroke="rgba(0,255,136,.1)" strokeDasharray="4,4" />
            })}
            {/* Y axis labels */}
            {[0,0.25,0.5,0.75,1].map(t => {
              const y = chartH - pad - t*(chartH-2*pad)
              return <text key={t} x={pad-5} y={y+3} fill="rgba(255,255,255,.3)" fontSize="8" textAnchor="end">{Math.round(t*stats.maxActivity)}</text>
            })}
            {/* Area fill */}
            <path d={`${linePath} L${actPoints[actPoints.length-1].x},${chartH-pad} L${actPoints[0].x},${chartH-pad} Z`}
              fill="url(#areaGrad)" opacity="0.3" />
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ff88" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00ff88" />
                <stop offset="100%" stopColor="#00e5ff" />
              </linearGradient>
            </defs>
            {/* Line */}
            <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ filter:'drop-shadow(0 0 6px rgba(0,255,136,.5))' }} />
            {/* Dots & Labels */}
            {actPoints.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="4" fill="#00ff88" stroke="#020c06" strokeWidth="2"
                  style={{ filter:'drop-shadow(0 0 4px rgba(0,255,136,.6))' }} />
                <text x={p.x} y={chartH-pad+14} textAnchor="middle" fill="rgba(255,255,255,.4)" fontSize="7.5">{p.date}</text>
                {p.count > 0 && <text x={p.x} y={p.y-8} textAnchor="middle" fill="#00ff88" fontSize="8" fontWeight="bold">{p.count}</text>}
              </g>
            ))}
          </svg>
        </div>

        {/* Severity Distribution Pie */}
        <div style={{
          background:'linear-gradient(135deg, rgba(0,255,136,.06), rgba(0,0,0,.3))',
          border:'1px solid rgba(0,255,136,.12)', borderRadius:20,
          padding:'1.5rem', backdropFilter:'blur(15px)',
          boxShadow:'0 10px 30px rgba(0,255,136,.05)',
          display:'flex', flexDirection:'column'
        }}>
          <h3 style={{ margin:'0 0 1rem', fontSize:'1rem', fontWeight:700, display:'flex', alignItems:'center', gap:'.5rem' }}>
            <span>📊</span>
            <span style={{ background:'linear-gradient(135deg,var(--g1),var(--g2))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Severity Distribution
            </span>
          </h3>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'2rem', flex:1 }}>
            {/* Pie */}
            <svg viewBox="0 0 160 160" style={{ width:140, height:140, filter:'drop-shadow(0 8px 20px rgba(0,0,0,.4))' }}>
              {pieSlices.length > 0 ? pieSlices.map((s,i) => (
                <path key={i} d={s.d} fill={s.color} stroke="#020c06" strokeWidth="1.5" opacity="0.85"
                  style={{ transition:'opacity .3s', cursor:'default' }}
                  onMouseOver={e=>e.target.style.opacity='1'}
                  onMouseOut={e=>e.target.style.opacity='0.85'} />
              )) : <circle cx="80" cy="80" r="70" fill="rgba(0,255,136,.1)" />}
            </svg>
            {/* Legend */}
            <div style={{ display:'flex', flexDirection:'column', gap:'.6rem' }}>
              {Object.entries(stats.sevCounts).map(([label, count]) => (
                <div key={label} style={{ display:'flex', alignItems:'center', gap:'.5rem', fontSize:'.82rem' }}>
                  <div style={{ width:10, height:10, borderRadius:3, background: sevColors[label], boxShadow:`0 0 6px ${sevColors[label]}` }} />
                  <span style={{ color: sevColors[label], fontWeight:700, minWidth:25 }}>{count > 0 ? Math.round(count/stats.sevTotal*100)+'%' : '0%'}</span>
                  <span style={{ color:'var(--muted)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW: Organ Breakdown + Top Conditions ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.2rem' }}>
        {/* Organ Breakdown */}
        <div style={{
          background:'linear-gradient(135deg, rgba(0,255,136,.06), rgba(0,0,0,.3))',
          border:'1px solid rgba(0,255,136,.12)', borderRadius:20,
          padding:'1.5rem', backdropFilter:'blur(15px)',
        }}>
          <h3 style={{ margin:'0 0 1rem', fontSize:'1rem', fontWeight:700, display:'flex', alignItems:'center', gap:'.5rem' }}>
            <span>🫁</span>
            <span style={{ background:'linear-gradient(135deg,var(--g1),var(--g2))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Scans by Organ
            </span>
          </h3>
          {Object.entries(stats.organCounts).sort((a,b)=>b[1]-a[1]).map(([organ, count]) => {
            const pct = Math.round(count/stats.total*100)
            const organColors = { Kidney:'linear-gradient(90deg,#ff6666,#ff4444)', Brain:'linear-gradient(90deg,#aa66ff,#ff66aa)', default:'linear-gradient(90deg,var(--g3),var(--g1))' }
            return (
              <div key={organ} style={{ display:'flex', alignItems:'center', gap:'.8rem', marginBottom:'.7rem', fontSize:'.82rem' }}>
                <span style={{ width:55, color:'var(--muted)', textAlign:'right', fontWeight:600 }}>{organ}</span>
                <div style={{ flex:1, height:24, background:'rgba(0,255,136,.06)', borderRadius:6, overflow:'hidden', border:'1px solid rgba(0,255,136,.08)' }}>
                  <div style={{
                    width:`${pct}%`, minWidth: pct>0?'18px':'0', height:'100%',
                    background: organColors[organ]||organColors.default,
                    display:'flex', alignItems:'center', paddingLeft:'.5rem',
                    fontSize:'.7rem', fontWeight:700, color:'#020c06',
                    transition:'width .6s ease', borderRadius:6
                  }}>{pct}%</div>
                </div>
                <span style={{ width:25, textAlign:'right', fontWeight:700, color:'var(--g1)', fontSize:'.85rem' }}>{count}</span>
              </div>
            )
          })}
        </div>

        {/* Top Conditions */}
        <div style={{
          background:'linear-gradient(135deg, rgba(0,255,136,.06), rgba(0,0,0,.3))',
          border:'1px solid rgba(0,255,136,.12)', borderRadius:20,
          padding:'1.5rem', backdropFilter:'blur(15px)',
        }}>
          <h3 style={{ margin:'0 0 1rem', fontSize:'1rem', fontWeight:700, display:'flex', alignItems:'center', gap:'.5rem' }}>
            <span>🔬</span>
            <span style={{ background:'linear-gradient(135deg,var(--g1),var(--g2))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Top Detected Conditions
            </span>
          </h3>
          {stats.topConditions.length > 0 ? stats.topConditions.map(([label, count], i) => (
            <div key={label} style={{
              display:'flex', alignItems:'center', gap:'.8rem',
              padding:'.6rem .8rem', marginBottom:'.5rem',
              background: i===0 ? 'rgba(0,255,136,.08)' : 'rgba(0,255,136,.03)',
              border:'1px solid rgba(0,255,136,.08)', borderRadius:10,
              transition:'all .2s'
            }}>
              <span style={{
                width:24, height:24, borderRadius:7,
                background: i===0 ? 'var(--g1)' : i===1 ? 'var(--g2)' : 'rgba(255,255,255,.15)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'.7rem', fontWeight:800, color:'#020c06'
              }}>{i+1}</span>
              <span style={{ flex:1, fontWeight:600, fontSize:'.85rem' }}>{label}</span>
              <span style={{
                background:'rgba(0,255,136,.12)', padding:'.2rem .6rem', borderRadius:6,
                fontSize:'.75rem', fontWeight:700, color:'var(--g1)',
                border:'1px solid rgba(0,255,136,.15)'
              }}>{count}x</span>
            </div>
          )) : <p style={{ color:'var(--muted)', fontSize:'.83rem' }}>No conditions detected yet</p>}
        </div>
      </div>
    </div>
  )
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * Math.PI / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export default function Reports() {
  const [reports,  setReports]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [preview,  setPreview]  = useState(null)  // selected report for modal
  const [search,   setSearch]   = useState('')
  const [hoveredStat, setHoveredStat] = useState(null)
  const toast = useToast()

  const load = async () => {
    try {
      const res = await reportsAPI.list()
      setReports(res.data)
    } catch (e) {
      toast('Failed to load reports', 'error')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filteredReports = reports.filter(r => 
    !search || r.patient_id.toLowerCase().includes(search.toLowerCase())
  )

  const doDelete = async (scanId) => {
    if (!confirm('Delete this report?')) return
    try {
      await reportsAPI.delete(scanId)
      toast('Report deleted')
      load()
    } catch (e) { toast('Delete failed', 'error') }
  }

  const severityClass = (s) => {
    if (s === 'Severe' || s === 'High') return 'badge-red'
    if (s === 'Moderate') return 'badge-yellow'
    return 'badge-green'
  }

  return (
    <div className="page-content">
      <div className="section-wrap">
        {/* Enhanced Header */}
        <div style={{
          background:'linear-gradient(135deg, rgba(0,255,136,.08), rgba(0,229,255,.05))',
          border:'1px solid rgba(0,255,136,.15)',
          borderRadius:'24px',
          padding:'2.5rem',
          backdropFilter:'blur(20px)',
          position:'relative',
          overflow:'hidden',
          marginBottom:'2rem',
          boxShadow:'0 20px 60px rgba(0,255,136,.1), inset 0 1px 0 rgba(255,255,255,.1)'
        }}>
          <div style={{
            position:'absolute',inset:0,
            background:'radial-gradient(circle at 80% 30%, rgba(0,229,255,.12) 0%, transparent 50%)',
            pointerEvents:'none'
          }}/>
          <div style={{position:'relative',zIndex:1,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'.8rem'}}>
                <span style={{fontSize:'2rem',animation:'float 3s ease-in-out infinite',display:'inline-block'}}>📋</span>
                <h1 style={{
                  margin:0,
                  background:'linear-gradient(135deg, var(--g1), var(--g2))',
                  WebkitBackgroundClip:'text',
                  WebkitTextFillColor:'transparent',
                  fontSize:'2.2rem',
                  fontWeight:800,
                  fontFamily:"'Syne',sans-serif"
                }}>My Reports</h1>
              </div>
              <p style={{color:'var(--muted)',fontSize:'.9rem',margin:0}}>
                All saved scan reports — <span style={{color:'var(--g1)',fontWeight:700}}>{reports.length}</span> total
              </p>
            </div>
            <div style={{display:'flex',gap:'1rem',alignItems:'center',flexWrap:'wrap'}}>
              <div style={{position:'relative'}}>
                <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:'.85rem',color:'var(--muted)',pointerEvents:'none'}}>🔍</span>
                <input
                  type="text"
                  placeholder="Search by Patient ID..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    padding:'.6rem 1rem .6rem 2.2rem',
                    border:'1px solid rgba(0,255,136,.2)',
                    borderRadius:12,
                    background:'rgba(0,255,136,.05)',
                    color:'var(--text)',
                    minWidth:220,
                    backdropFilter:'blur(10px)',
                    outline:'none',
                    transition:'all .3s',
                    fontSize:'.85rem'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--g1)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(0,255,136,.2)'}
                />
              </div>
              <a href="/upload" className="btn btn-primary" style={{borderRadius:12,padding:'.6rem 1.5rem',boxShadow:'0 8px 24px rgba(0,200,83,.3)'}}>+ New Scan</a>
            </div>
          </div>
        </div>

        {/* ═══ ANALYTICS DASHBOARD ═══ */}
        {!loading && reports.length > 0 && <AnalyticsDashboard reports={reports} hoveredStat={hoveredStat} setHoveredStat={setHoveredStat} />}

        {loading ? (
          <div style={{ display:'grid', gap:'1rem' }}>
            {[1,2,3].map(i => <div key={i} className="shimmer" style={{ height:80,borderRadius:16 }} />)}
          </div>
        ) : reports.length === 0 ? (
          <div style={{
            background:'linear-gradient(135deg, rgba(0,255,136,.06), rgba(0,229,255,.03))',
            border:'1px solid rgba(0,255,136,.15)',
            borderRadius:'20px',
            padding:'4rem 2rem',
            backdropFilter:'blur(15px)',
            textAlign:'center',
            boxShadow:'0 15px 40px rgba(0,255,136,.08)'
          }}>
            <div style={{fontSize:'4rem',marginBottom:'1.5rem',animation:'float 3s ease-in-out infinite'}}>📋</div>
            <h3 style={{
              background:'linear-gradient(135deg, var(--g1), var(--g2))',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
              fontSize:'1.5rem',fontWeight:700
            }}>No reports yet</h3>
            <p style={{color:'var(--muted)',marginTop:'.8rem',fontSize:'.9rem'}}>Upload your first scan to get started</p>
            <a href="/upload" className="btn btn-primary" style={{marginTop:'1.5rem',borderRadius:12,padding:'.7rem 2rem'}}>Upload Scan →</a>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            {filteredReports.map((r, idx) => (
              <div 
                key={r.scan_id || idx}
                style={{
                  background:'linear-gradient(135deg, rgba(0,255,136,.06), rgba(0,229,255,.03))',
                  border:'1px solid rgba(0,255,136,.12)',
                  borderRadius:'16px',
                  padding:'1.5rem',
                  backdropFilter:'blur(15px)',
                  transition:'all .4s cubic-bezier(0.23, 1, 0.320, 1)',
                  cursor:'pointer',
                  position:'relative',
                  overflow:'hidden',
                  boxShadow:'0 8px 25px rgba(0,255,136,.05)'
                }}
                onMouseOver={e=>{e.currentTarget.style.transform='translateY(-4px) scale(1.01)';e.currentTarget.style.boxShadow='0 20px 50px rgba(0,255,136,.12)';e.currentTarget.style.borderColor='rgba(0,255,136,.3)'}}
                onMouseOut={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 8px 25px rgba(0,255,136,.05)';e.currentTarget.style.borderColor='rgba(0,255,136,.12)'}}
                onClick={() => setPreview(r)}
              >
                <div style={{display:'grid',gridTemplateColumns:'auto 1fr auto',gap:'1.5rem',alignItems:'center'}}>
                  {/* 3D Icon */}
                  <div style={{
                    width:56,height:56,borderRadius:14,
                    background:'linear-gradient(135deg, rgba(0,200,83,.25), rgba(0,229,255,.15))',
                    border:'1px solid rgba(0,255,136,.25)',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:'1.8rem',
                    boxShadow:'0 8px 20px rgba(0,255,136,.15)',
                    transition:'all .3s'
                  }}>{r.organ_icon || '🫁'}</div>

                  {/* Info */}
                  <div style={{display:'flex',flexDirection:'column',gap:'.4rem'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'.8rem',flexWrap:'wrap'}}>
                      <strong style={{
                        fontSize:'.95rem',
                        background:'linear-gradient(135deg, var(--g1), var(--g2))',
                        WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'
                      }}>{r.scan_id || 'N/A'}</strong>
                      <span style={{
                        fontSize:'.7rem',color:'var(--muted)',
                        background:'rgba(0,255,136,.08)',
                        padding:'.2rem .6rem',borderRadius:6,
                        border:'1px solid rgba(0,255,136,.1)'
                      }}>{r.organ}</span>
                      <span style={{fontSize:'.75rem',color:'var(--muted)'}}>
                        {r.date ? new Date(r.date).toLocaleDateString() : '—'}
                      </span>
                    </div>
                    <div style={{display:'flex',gap:'.4rem',flexWrap:'wrap'}}>
                      {(r.detections || []).map((d, i) => (
                        <span key={i} style={{
                          fontSize:'.7rem',
                          padding:'.15rem .5rem',
                          borderRadius:6,
                          background:'rgba(255,170,0,.12)',
                          border:'1px solid rgba(255,170,0,.25)',
                          color:'#ffaa00',
                          fontWeight:600
                        }}>{d.label}</span>
                      ))}
                    </div>
                  </div>

                  {/* Right Stats */}
                  <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                    <div style={{textAlign:'center'}}>
                      <div style={{fontSize:'.65rem',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:'.2rem'}}>Severity</div>
                      <span className={`badge ${severityClass(r.overall_severity)}`} style={{fontSize:'.75rem'}}>{r.overall_severity}</span>
                    </div>
                    <div style={{textAlign:'center'}}>
                      <div style={{fontSize:'.65rem',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:'.2rem'}}>Confidence</div>
                      <span style={{color:'var(--g1)',fontWeight:700,fontSize:'.9rem'}}>{r.confidence}%</span>
                    </div>
                    <button 
                      className="btn btn-danger" 
                      style={{padding:'.4rem .8rem',fontSize:'.75rem',borderRadius:8}}
                      onClick={(e) => {e.stopPropagation(); doDelete(r.scan_id)}}
                    >🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── PREVIEW MODAL ── */}
      {preview && (
        <div onClick={e=>e.target===e.currentTarget&&setPreview(null)} style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,.85)',
          zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem',
          backdropFilter:'blur(8px)'
        }}>
          <div style={{
            background:'linear-gradient(135deg, rgba(4,26,10,.98), rgba(0,255,136,.04))',
            border:'1px solid rgba(0,255,136,.2)',
            borderRadius:24, padding:'2.5rem', maxWidth:750, width:'100%',
            maxHeight:'90vh', overflowY:'auto',
            boxShadow:'0 40px 80px rgba(0,0,0,.6), 0 0 100px rgba(0,255,136,.1)',
            animation:'fadeIn .3s ease-out'
          }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'2rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:'.8rem'}}>
                <span style={{fontSize:'1.5rem'}}>📋</span>
                <h3 style={{
                  margin:0,
                  background:'linear-gradient(135deg, var(--g1), var(--g2))',
                  WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
                  fontSize:'1.3rem'
                }}>Report: {preview.scan_id}</h3>
              </div>
              <button 
                onClick={()=>setPreview(null)}
                style={{
                  width:36,height:36,borderRadius:10,
                  background:'rgba(255,68,68,.15)',
                  border:'1px solid rgba(255,68,68,.3)',
                  color:'#ff4444',fontSize:'1rem',
                  cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',
                  transition:'all .2s'
                }}
                onMouseOver={e=>e.target.style.background='rgba(255,68,68,.3)'}
                onMouseOut={e=>e.target.style.background='rgba(255,68,68,.15)'}
              >✕</button>
            </div>

            {/* 3D Model */}
            <div style={{
              background:'linear-gradient(135deg, rgba(0,0,0,.5), rgba(0,255,136,.05))',
              border:'1px solid rgba(0,255,136,.15)',
              borderRadius:16, height:320, overflow:'hidden', marginBottom:'2rem',
              boxShadow:'0 15px 40px rgba(0,255,136,.1), inset 0 0 60px rgba(0,255,136,.05)',
              position:'relative'
            }}>
              <div style={{
                position:'absolute',inset:0,
                backgroundImage:'linear-gradient(rgba(0,255,136,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,.05) 1px,transparent 1px)',
                backgroundSize:'24px 24px',pointerEvents:'none',zIndex:1
              }}/>
              <ModelViewer
                src={preview.model_3d_url ? preview.model_3d_url : null}
                alt={`${preview.organ} 3D Model`}
              />
            </div>

            <div style={{
              padding:'1rem 1.2rem',
              background:'linear-gradient(135deg, rgba(0,229,255,.08), rgba(0,255,136,.05))',
              border:'1px solid rgba(0,229,255,.2)',
              borderRadius:12,marginBottom:'1.5rem',
              display:'flex',alignItems:'center',gap:'.8rem',
              fontSize:'.85rem'
            }}>
              <span>📋</span>
              <span>Date: {preview.date ? new Date(preview.date).toLocaleString() : '—'} · Organ: <strong>{preview.organ}</strong> · Patient: {preview.patient_id || 'N/A'}</span>
            </div>

            <h3 style={{
              marginBottom:'1rem',
              background:'linear-gradient(135deg, var(--g1), var(--g2))',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
              fontSize:'1.1rem'
            }}>🔬 Detections</h3>
            {(preview.detections || []).map((d, i) => (
              <div key={i} style={{
                display:'flex',justifyContent:'space-between',alignItems:'center',
                padding:'.8rem 1rem',
                background:'rgba(0,255,136,.04)',
                border:'1px solid rgba(0,255,136,.1)',
                borderRadius:10,marginBottom:'.5rem',
                transition:'all .2s'
              }}
                onMouseOver={e=>e.currentTarget.style.background='rgba(0,255,136,.08)'}
                onMouseOut={e=>e.currentTarget.style.background='rgba(0,255,136,.04)'}
              >
                <span style={{fontWeight:600}}>{d.label}</span>
                <span style={{display:'flex',gap:'.5rem',alignItems:'center'}}>
                  <span className="badge badge-yellow">{Math.round(d.confidence * 100)}% conf</span>
                  <span className={`badge ${d.severity==='High'||d.severity==='Severe'?'badge-red':d.severity==='Moderate'?'badge-yellow':'badge-green'}`}>
                    {d.severity}
                  </span>
                </span>
              </div>
            ))}
            <div style={{
              display:'flex',justifyContent:'space-between',alignItems:'center',
              padding:'1rem',
              background:'linear-gradient(135deg, rgba(0,255,136,.08), rgba(0,229,255,.05))',
              border:'1px solid rgba(0,255,136,.2)',
              borderRadius:12,marginTop:'.8rem'
            }}>
              <span style={{fontWeight:600,color:'var(--muted)'}}>Overall Severity</span>
              <span className={`badge ${preview.overall_severity==='High'||preview.overall_severity==='Severe'?'badge-red':preview.overall_severity==='Moderate'?'badge-yellow':'badge-green'}`}>
                {preview.overall_severity}
              </span>
            </div>

            {preview.recommendations?.length > 0 && (
              <>
                <h3 style={{
                  margin:'1.5rem 0 1rem',
                  background:'linear-gradient(135deg, var(--g1), var(--g2))',
                  WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
                  fontSize:'1.1rem'
                }}>💡 Recommendations</h3>
                {preview.recommendations.map((rec, i) => (
                  <div key={i} style={{
                    display:'flex',gap:'.8rem',padding:'1rem',
                    background:'rgba(0,255,136,.04)',
                    border:'1px solid rgba(0,255,136,.1)',
                    borderRadius:10,marginBottom:'.5rem',
                    transition:'all .2s'
                  }}
                    onMouseOver={e=>e.currentTarget.style.background='rgba(0,255,136,.08)'}
                    onMouseOut={e=>e.currentTarget.style.background='rgba(0,255,136,.04)'}
                  >
                    <span>{rec.icon}</span>
                    <span style={{fontSize:'.85rem',lineHeight:1.6}}>{rec.text}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
