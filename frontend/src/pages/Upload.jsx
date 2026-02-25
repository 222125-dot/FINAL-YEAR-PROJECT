import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyzeAPI } from '../utils/api'
import { useToast } from '../utils/ToastContext'
import ModelViewer from '../components/ModelViewer'

const SEVERITY_COLOR = {
  Severe:   '#ff2222',
  High:     '#ff6600',
  Moderate: '#ffaa00',
  Low:      'var(--g1)',
}
const SEVERITY_WIDTH = { Severe: '95%', High: '75%', Moderate: '45%', Low: '20%' }

export default function Upload() {
  const toast    = useToast()
  const navigate = useNavigate()
  const inputRef = useRef()

  const [file,        setFile]        = useState(null)
  const [preview,     setPreview]     = useState(null)
  const [organ,       setOrgan]       = useState('Kidney')
  const [patientId,   setPatientId]   = useState('')
  const [dragging,    setDragging]    = useState(false)
  const [analyzing,   setAnalyzing]   = useState(false)
  const [result,      setResult]      = useState(null)

  // ── File handling ─────────────────────────────────────────────────────────
  const handleFile = (f) => {
    if (!f) return
    setFile(f)
    setResult(null)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target.result)
    reader.readAsDataURL(f)
    toast(`📁 Loaded: ${f.name}`)
  }

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  // ── Run Analysis ──────────────────────────────────────────────────────────
  const runAnalysis = async () => {
    if (!file) { toast('Please upload a scan first', 'warn'); return }
    setAnalyzing(true)
    setResult(null)

    const form = new FormData()
    form.append('file',       file)
    form.append('organ',      organ)
    form.append('patient_id', patientId)

    try {
      const res = await analyzeAPI.scan(form)
      setResult(res.data)
      toast(`✅ Analysis done — ${res.data.total_found} condition(s) detected`)
    } catch (e) {
      toast(e.response?.data?.detail || 'Analysis failed', 'error')
    } finally {
      setAnalyzing(false)
    }
  }

  const severityBadgeClass = (s) => {
    if (s === 'Severe' || s === 'High') return 'badge-red'
    if (s === 'Moderate') return 'badge-yellow'
    return 'badge-green'
  }

  return (
    <div className="page-content">
      <div className="section-wrap">
        <h2 style={{ marginBottom:'.4rem' }}>Upload Kidney Scan</h2>
        <p style={{ color:'var(--muted)', fontSize:'.88rem', marginBottom:'2rem' }}>
          Upload your kidney scan — YOLO AI detects conditions and maps them to the 3D kidney mesh.
        </p>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', alignItems:'start' }}>
          {/* ── LEFT ── */}
          <div>
            {/* Drop zone */}
            <div
              onDragOver={e=>{e.preventDefault();setDragging(true)}}
              onDragLeave={()=>setDragging(false)}
              onDrop={onDrop}
              onClick={()=>inputRef.current.click()}
              style={{
                border: `2px dashed ${dragging||file ? 'var(--g1)' : 'rgba(0,255,136,.2)'}`,
                borderRadius:16, padding:'2.5rem 2rem',
                textAlign:'center', cursor:'pointer',
                background: dragging||file ? 'rgba(0,255,136,.06)' : 'rgba(0,255,136,.02)',
                transition:'all .3s', minHeight:180,
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'.8rem',
              }}
            >
              <input ref={inputRef} type="file" hidden accept=".png,.jpg,.jpeg,.tiff,.dcm"
                onChange={e=>handleFile(e.target.files[0])} />
              {preview ? (
                <>
                  <img src={preview} alt="preview" style={{ maxHeight:120, borderRadius:8, objectFit:'cover' }} />
                  <span style={{ fontSize:'.82rem', color:'var(--g1)' }}>✅ {file?.name}</span>
                </>
              ) : (
                <>
                  <div style={{ fontSize:'2.5rem' }}>🫁</div>
                  <div style={{ fontSize:'1rem', fontWeight:500 }}>Drop scan or click to browse</div>
                  <div style={{ fontSize:'.8rem', color:'var(--muted)' }}>PNG, JPG, TIFF, DICOM</div>
                  <div style={{ fontSize:'.7rem', color:'var(--warn)', marginTop:'.3rem' }}>⚠️ Kidney scans only</div>
                </>
              )}
            </div>

            {/* Settings */}
            <div className="card" style={{ marginTop:'1rem' }}>
              <h3 style={{ marginBottom:'1rem' }}>Scan Settings</h3>
              <div className="form-group">
                <label>Organ / Region</label>
                <select value={organ} onChange={e=>setOrgan(e.target.value)}>
                  <option>Kidney</option><option>Liver</option>
                  <option>Brain</option><option>Lung</option><option>Heart</option>
                </select>
              </div>
              <div className="form-group">
                <label>Patient ID (optional)</label>
                <input value={patientId} onChange={e=>setPatientId(e.target.value)} placeholder="PT-2025-001" />
              </div>
              <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }}
                onClick={runAnalysis} disabled={analyzing || !file}>
                {analyzing
                  ? <><span className="spin" style={{width:16,height:16,border:'2px solid rgba(0,0,0,.3)',borderTopColor:'#020c06',borderRadius:'50%',display:'inline-block'}}></span> Analyzing...</>
                  : '🔍 Analyze with AI →'}
              </button>
            </div>

            {/* Results */}
            {result && (
              <div style={{ marginTop:'1rem' }} className="fade-in">
                <div className={`alert alert-${result.overall_severity === 'Severe' || result.overall_severity === 'High' ? 'danger' : 'warn'}`}
                  style={{ marginBottom:'1rem' }}>
                  <span>⚠️</span>
                  <span><strong>{result.total_found} condition(s) detected</strong> — {result.overall_severity} severity · {result.confidence}% confidence</span>
                </div>

            {/* Results */}
            {result && (
              <div style={{ marginTop:'1rem' }} className="fade-in">
                <div className={`alert alert-${result.overall_severity === 'Severe' || result.overall_severity === 'High' ? 'danger' : 'warn'}`}
                  style={{ marginBottom:'1rem', position:'relative', overflow:'hidden' }}>
                  <div style={{
                    position:'absolute', top:0, left:0, right:0, bottom:0,
                    background:'linear-gradient(45deg, transparent 30%, rgba(255,255,255,.1) 50%, transparent 70%)',
                    animation:'shimmer 2s infinite'
                  }}/>
                  <span>⚠️</span>
                  <span><strong>{result.total_found} condition(s) detected</strong> — {result.overall_severity} severity · {result.confidence}% confidence</span>
                </div>

                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem'}}>
                  <div style={{ background:'rgba(0,0,0,.2)', border:'1px solid var(--border)', borderRadius:12, padding:'1rem' }}>
                    <h4 style={{marginBottom:'.8rem', color:'var(--g1)', fontSize:'1rem'}}>🔍 Detected Conditions</h4>
                    {result.detections.map((d, i) => (
                      <div key={i} className="result-row" style={{alignItems:'center'}}>
                        <span className="result-label" style={{display:'flex', alignItems:'center', gap:'.5rem'}}>
                          <span style={{fontSize:'1.1rem'}}>●</span>
                          {d.label}
                        </span>
                        <div className="severity-bar" style={{flex:1, margin:'0 .5rem'}}>
                          <div className="severity-fill" style={{
                            width: SEVERITY_WIDTH[d.severity] || '40%',
                            background: `linear-gradient(90deg, ${SEVERITY_COLOR[d.severity]||'var(--g1)'}, ${SEVERITY_COLOR[d.severity]||'var(--g1)'})`,
                            transition:'width .5s ease'
                          }}/>
                        </div>
                        <span className={`badge ${severityBadgeClass(d.severity)}`}>
                          {d.severity}
                        </span>
                      </div>
                    ))}
                    <div className="result-row" style={{ marginTop:'.5rem', borderTop:'1px solid var(--border)', paddingTop:'.5rem' }}>
                      <span className="result-label">⏱️ Analysis Time</span>
                      <span style={{ color:'var(--g1)', fontWeight:500 }}>{result.analysis_time}s</span>
                    </div>
                  </div>

                  <div style={{ background:'rgba(0,0,0,.2)', border:'1px solid var(--border)', borderRadius:12, padding:'1rem' }}>
                    <h4 style={{marginBottom:'.8rem', color:'var(--g1)', fontSize:'1rem'}}>💡 AI Recommendations</h4>
                    {result.recommendations?.map((r, i) => (
                      <div key={i} style={{
                        display:'flex', gap:'.8rem', padding:'.8rem',
                        border:'1px solid var(--border)', borderRadius:8,
                        marginBottom:'.5rem', background:'rgba(0,255,136,.02)',
                        transition:'transform .2s',
                        cursor:'pointer'
                      }}
                      onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'}
                      onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
                        <span style={{ fontSize:'1.2rem' }}>{r.icon}</span>
                        <span style={{ fontSize:'.85rem', lineHeight:1.5 }}>{r.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{display:'flex', gap:'1rem'}}>
                  {result.model_3d_url && (
                    <button className="btn btn-primary" style={{ flex:1, justifyContent:'center', position:'relative', overflow:'hidden' }}
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = result.model_3d_url;
                        link.download = `kidney_analysis_${result.scan_id}.glb`;
                        link.click();
                      }}>
                      <div style={{
                        position:'absolute', top:0, left:0, right:0, bottom:0,
                        background:'linear-gradient(45deg, transparent 30%, rgba(255,255,255,.1) 50%, transparent 70%)',
                        animation:'shimmer 2s infinite'
                      }}/>
                      📥 Download 3D Model (.glb)
                    </button>
                  )}
                  <button className="btn btn-outline" style={{ flex:1, justifyContent:'center' }}
                    onClick={()=>navigate('/reports')}>
                    📊 View in Reports →
                  </button>
                </div>
              </div>
            )}
              </div>
            )}
          </div>

          {/* ── RIGHT: 3D VIEWER ── */}
          <div>
            <div style={{
              background:'rgba(0,0,0,.4)', border:'1px solid var(--border)',
              borderRadius:16, minHeight:400, overflow:'hidden',
              position:'relative', display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {/* Scan line animation when analyzing */}
              {analyzing && (
                <div style={{
                  position:'absolute', left:0, right:0, height:2, zIndex:10,
                  background:'linear-gradient(90deg,transparent,var(--g1),transparent)',
                  animation:'scan 2s linear infinite',
                }}/>
              )}

              <ModelViewer
                src={
                  result?.model_3d_url
                    ? result.model_3d_url
                    : null
                }
                alt="Analyzed Kidney 3D Model"
              />

              {/* Overlay labels on 3D model */}
              {result?.detections?.length > 0 && (
                <div style={{
                  position:'absolute', bottom:'1rem', left:'1rem',
                  display:'flex', flexWrap:'wrap', gap:'.4rem',
                }}>
                  {result.detections.map((d,i) => (
                    <span key={i} className={`badge ${severityBadgeClass(d.severity)}`}>
                      ● {d.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Model info */}
            <div className="card" style={{ marginTop:'1rem' }}>
              <h3 style={{ marginBottom:'.8rem' }}>Model Info</h3>
              {result ? (
                <>
                  <div className="result-row"><span className="result-label">Scan ID</span><strong>{result.scan_id}</strong></div>
                  <div className="result-row"><span className="result-label">Organ</span><span>{result.organ}</span></div>
                  <div className="result-row"><span className="result-label">Conditions Found</span><span>{result.total_found}</span></div>
                  <div className="result-row"><span className="result-label">Confidence</span><span style={{color:'var(--g1)'}}>{result.confidence}%</span></div>
                  <div className="result-row"><span className="result-label">3D Mesh</span>
                    <span className="badge badge-green">{result.model_3d_url ? 'Rendered' : 'Base'}</span>
                  </div>
                </>
              ) : (
                <p style={{ color:'var(--muted)', fontSize:'.83rem' }}>
                  Run analysis to see model details.
                  {!file && <><br/>Upload a scan to get started.</>}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
