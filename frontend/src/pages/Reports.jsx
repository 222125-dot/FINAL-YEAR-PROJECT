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
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <h2>My Reports</h2>
            <p style={{ color:'var(--muted)', fontSize:'.85rem', marginTop:'.3rem' }}>
              All saved scan reports — <strong>{reports.length}</strong> total
            </p>
          </div>
          <div style={{ display:'flex', gap:'1rem', alignItems:'center' }}>
            <input
              type="text"
              placeholder="Search by Patient ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding:'.5rem 1rem',
                border:'1px solid var(--border)',
                borderRadius:8,
                background:'var(--dark2)',
                color:'var(--text)',
                minWidth:200,
              }}
            />
            <a href="/upload" className="btn btn-outline">+ New Scan</a>
          </div>
        </div>

        {loading ? (
          <div style={{ display:'grid', gap:'1rem' }}>
            {[1,2,3].map(i => <div key={i} className="shimmer" style={{ height:56 }} />)}
          </div>
        ) : reports.length === 0 ? (
          <div className="card" style={{ textAlign:'center', padding:'3rem' }}>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📋</div>
            <h3>No reports yet</h3>
            <p style={{ color:'var(--muted)', marginTop:'.5rem' }}>Upload your first scan to get started</p>
          </div>
        ) : (
          <div className="card">
            <div style={{ overflowX:'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>3D Preview</th>
                    <th>Scan ID</th>
                    <th>Date</th>
                    <th>Organ</th>
                    <th>Conditions</th>
                    <th>Severity</th>
                    <th>Confidence</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((r, idx) => (
                    <tr key={r.scan_id || idx}>
                      <td>
                        <div
                          onClick={() => setPreview(r)}
                          style={{
                            width:44, height:44, borderRadius:8, cursor:'pointer',
                            background:'linear-gradient(135deg,rgba(0,200,83,.2),rgba(0,229,255,.1))',
                            border:'1px solid var(--border)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:'1.3rem',
                          }}
                          title="Preview 3D model"
                        >{r.organ_icon || '🫁'}</div>
                      </td>
                      <td><strong style={{ fontSize:'.82rem' }}>{r.scan_id || 'N/A'}</strong></td>
                      <td style={{ color:'var(--muted)' }}>
                        {r.date ? new Date(r.date).toLocaleDateString() : '—'}
                      </td>
                      <td>{r.organ}</td>
                      <td>
                        {(r.detections || []).map((d, i) => (
                          <span key={i} className="badge badge-yellow" style={{ margin:'.1rem', display:'inline-block' }}>
                            {d.label}
                          </span>
                        ))}
                      </td>
                      <td>
                        <span className={`badge ${severityClass(r.overall_severity)}`}>
                          {r.overall_severity}
                        </span>
                      </td>
                      <td style={{ color:'var(--g1)', fontWeight:600 }}>{r.confidence}%</td>
                      <td>
                        <div style={{ display:'flex', gap:'.4rem' }}>
                          <button className="btn btn-outline" style={{ padding:'.25rem .6rem', fontSize:'.75rem' }}
                            onClick={() => setPreview(r)}>Preview</button>
                          <button className="btn btn-danger" style={{ padding:'.25rem .6rem', fontSize:'.75rem' }}
                            onClick={() => doDelete(r.scan_id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── PREVIEW MODAL ── */}
      {preview && (
        <div onClick={e=>e.target===e.currentTarget&&setPreview(null)} style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,.8)',
          zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem',
        }}>
          <div style={{
            background:'var(--dark2)', border:'1px solid var(--border)',
            borderRadius:20, padding:'2rem', maxWidth:700, width:'100%',
            maxHeight:'90vh', overflowY:'auto',
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <h3>Report: {preview.scan_id}</h3>
              <button className="btn btn-outline" style={{ padding:'.3rem .7rem' }} onClick={()=>setPreview(null)}>✕</button>
            </div>

            {/* 3D Model */}
            <div style={{
              background:'rgba(0,0,0,.4)', border:'1px solid var(--border)',
              borderRadius:12, height:300, overflow:'hidden', marginBottom:'1.5rem',
            }}>
              <ModelViewer
                src={preview.model_3d_url ? preview.model_3d_url : null}
                alt={`${preview.organ} 3D Model`}
              />
            </div>

            <div className="alert alert-info" style={{ marginBottom:'1rem' }}>
              <span>📋</span>
              <span>Date: {preview.date ? new Date(preview.date).toLocaleString() : '—'} · Organ: {preview.organ} · Patient: {preview.patient_id || 'N/A'}</span>
            </div>

            <h3 style={{ marginBottom:'.8rem' }}>Detections</h3>
            {(preview.detections || []).map((d, i) => (
              <div key={i} className="result-row">
                <span>{d.label}</span>
                <span style={{ display:'flex', gap:'.5rem', alignItems:'center' }}>
                  <span className="badge badge-yellow">{Math.round(d.confidence * 100)}% conf</span>
                  <span className={`badge ${d.severity==='High'||d.severity==='Severe'?'badge-red':d.severity==='Moderate'?'badge-yellow':'badge-green'}`}>
                    {d.severity}
                  </span>
                </span>
              </div>
            ))}
            <div className="result-row">
              <span className="result-label">Overall Severity</span>
              <span className={`badge ${preview.overall_severity==='High'||preview.overall_severity==='Severe'?'badge-red':preview.overall_severity==='Moderate'?'badge-yellow':'badge-green'}`}>
                {preview.overall_severity}
              </span>
            </div>

            {preview.recommendations?.length > 0 && (
              <>
                <h3 style={{ margin:'1.2rem 0 .8rem' }}>Recommendations</h3>
                {preview.recommendations.map((rec, i) => (
                  <div key={i} style={{
                    display:'flex', gap:'.8rem', padding:'.8rem',
                    border:'1px solid var(--border)', borderRadius:8, marginBottom:'.5rem',
                  }}>
                    <span>{rec.icon}</span>
                    <span style={{ fontSize:'.83rem', lineHeight:1.6 }}>{rec.text}</span>
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
