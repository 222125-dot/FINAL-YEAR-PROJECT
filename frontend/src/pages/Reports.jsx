import React, { useState, useEffect } from 'react'
import { reportsAPI } from '../utils/api'
import { useToast } from '../utils/ToastContext'
import ModelViewer from '../components/ModelViewer'

export default function Reports() {
  const [reports,  setReports]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [preview,  setPreview]  = useState(null)  // selected report for modal
  const [search,   setSearch]   = useState('')
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
