import React, { useState } from 'react'
import { text3dAPI } from '../utils/api'
import { useToast } from '../utils/ToastContext'
import ModelViewer from '../components/ModelViewer'

const QUICK_PROMPTS = [
  'Show me a kidney',
  'Display the brain',
  'Human Heart model',
  'Liver Organ',
  'Lung structure',
  'Intestine system',
  'Human body model',
  'Hand model',
]

export default function TextTo3D() {
  const [prompt,   setPrompt]   = useState('')
  const [style,    setStyle]    = useState('medical')
  const [busy,     setBusy]     = useState(false)
  const [result,   setResult]   = useState(null)
  const [history,  setHistory]  = useState([])
  const toast = useToast()

  const generate = async () => {
    if (!prompt.trim()) { toast('Enter a prompt first', 'warn'); return }
    setBusy(true)
    setResult(null)
    try {
      const res = await text3dAPI.generate({ prompt, style })
      setResult(res.data)
      setHistory(h => [res.data, ...h].slice(0, 5))
      toast('✅ 3D model generated!')
    } catch (e) {
      toast(e.response?.data?.detail || 'Generation failed', 'error')
    } finally { setBusy(false) }
  }

  return (
    <div className="page-content">
      <div className="section-wrap">
        <h2 style={{ marginBottom:'.3rem' }}>Text to 3D Model</h2>
        <p style={{ color:'var(--muted)', fontSize:'.85rem', marginBottom:'2rem' }}>
          Type the name of an organ — get the corresponding 3D model instantly.
        </p>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:'1.5rem', alignItems:'start' }}>
          {/* ── LEFT: PROMPT ── */}
          <div>
            <div className="card">
              <h3 style={{ marginBottom:'1rem' }}>Describe the Model</h3>

              <p style={{ fontSize:'.78rem', color:'var(--muted)', marginBottom:'.6rem' }}>Quick prompts:</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'.5rem', marginBottom:'1rem' }}>
                {QUICK_PROMPTS.map((p, i) => (
                  <div key={i} onClick={() => setPrompt(p)} style={{
                    padding:'.3rem .8rem', background:'rgba(0,255,136,.06)',
                    border:'1px solid var(--border)', borderRadius:20,
                    fontSize:'.74rem', color:'var(--muted)', cursor:'pointer',
                    transition:'all .2s',
                  }}
                  onMouseOver={e=>{e.target.style.color='var(--g1)';e.target.style.borderColor='rgba(0,255,136,.3)'}}
                  onMouseOut={e=>{e.target.style.color='var(--muted)';e.target.style.borderColor='var(--border)'}}>
                    {p.length > 35 ? p.slice(0,35)+'...' : p}
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>Your Prompt</label>
                <textarea rows={5} value={prompt} onChange={e=>setPrompt(e.target.value)}
                  placeholder="e.g. A kidney with a 2cm renal cell carcinoma in the upper pole showing blood vessel involvement..." />
              </div>
              <div className="form-group">
                <label>Visual Style</label>
                <select value={style} onChange={e=>setStyle(e.target.value)}>
                  <option value="medical">Medical / Clinical</option>
                  <option value="atlas">Anatomical Atlas</option>
                  <option value="xray">X-Ray Style</option>
                  <option value="wireframe">Transparent Wireframe</option>
                </select>
              </div>
              <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }}
                onClick={generate} disabled={busy}>
                {busy
                  ? <><span className="spin" style={{ width:16,height:16,border:'2px solid rgba(0,0,0,.3)',borderTopColor:'#020c06',borderRadius:'50%',display:'inline-block' }}></span> Loading...</>
                  : '🔍 Find 3D Model →'}
              </button>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="card" style={{ marginTop:'1rem' }}>
                <h3 style={{ marginBottom:'1rem' }}>Recent Generations</h3>
                {history.map((h, i) => (
                  <div key={i} onClick={() => setResult(h)} style={{
                    padding:'.7rem', border:'1px solid var(--border)', borderRadius:8,
                    marginBottom:'.5rem', cursor:'pointer', transition:'background .2s',
                  }}
                  onMouseOver={e=>e.currentTarget.style.background='rgba(0,255,136,.04)'}
                  onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                    <div style={{ fontSize:'.78rem', fontWeight:500 }}>
                      {h.prompt.slice(0, 55)}{h.prompt.length > 55 ? '...' : ''}
                    </div>
                    <div style={{ fontSize:'.7rem', color:'var(--muted)', marginTop:'.2rem' }}>
                      {h.organ_type} · {(h.anomalies || []).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: VIEWER ── */}
          <div>
            <div style={{
              background:'rgba(0,0,0,.5)', border:'1px solid var(--border)',
              borderRadius:20, minHeight:450, overflow:'hidden', position:'relative',
            }}>
              {/* Grid background */}
              <div style={{
                position:'absolute', inset:0,
                backgroundImage:'linear-gradient(rgba(0,255,136,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,.04) 1px,transparent 1px)',
                backgroundSize:'30px 30px',
              }}/>

              {busy && (
                <div style={{
                  position:'absolute', inset:0, zIndex:10,
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1rem',
                }}>
                  <div style={{ width:48, height:48, border:'3px solid var(--border)', borderTopColor:'var(--g1)', borderRadius:'50%' }} className="spin"/>
                  <p style={{ fontSize:'.88rem', color:'var(--muted)', textAlign:'center' }}>
                    Loading 3D model...<br/>
                    <span style={{ fontSize:'.75rem' }}>Matching your request to available models</span>
                  </p>
                </div>
              )}

              <ModelViewer
                src={result?.model_url || null}
                alt="Generated 3D Model"
              />
            </div>

            {/* Description */}
            <div className="card" style={{ marginTop:'1rem' }}>
              <h3 style={{ marginBottom:'.8rem' }}>Model Description</h3>
              {result ? (
                <>
                  <p style={{ fontSize:'.85rem', lineHeight:1.7, color:'var(--muted)', marginBottom:'1rem' }}>
                    {result.description}
                  </p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'.5rem' }}>
                    <span className="badge badge-blue">{result.organ_type}</span>
                    {(result.anomalies || []).map((a, i) => (
                      <span key={i} className="badge badge-red">{a}</span>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:'1rem', marginTop:'1rem' }}>
                    {result.model_url && (
                      <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }}
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = result.model_url;
                          link.download = `${result.organ_type}_model.glb`;
                          link.click();
                        }}>
                        📥 Download 3D Model
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <p style={{ fontSize:'.83rem', color:'var(--muted)', lineHeight:1.7 }}>
                  Type an organ name to load the corresponding 3D model.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
