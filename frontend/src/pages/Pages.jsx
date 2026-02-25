// ═══════════════════════════════════════════
//  HOME PAGE — with interactive 3D human model
// ═══════════════════════════════════════════
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function Home() {
  const navigate = useNavigate()
  return (
    <div className="page-content">
      {/* HERO */}
      <section style={{
        minHeight:'92vh', display:'flex', alignItems:'center',
        padding:'3rem 2rem', maxWidth:1200, margin:'0 auto',
        gap:'3rem', flexWrap:'wrap',
      }}>
        {/* LEFT TEXT */}
        <div style={{ flex:'1', minWidth:300 }}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:'.6rem',
            background:'rgba(0,255,136,.08)', border:'1px solid rgba(0,255,136,.2)',
            padding:'.3rem 1rem', borderRadius:20,
            fontSize:'.78rem', fontWeight:600, color:'var(--g1)',
            letterSpacing:'.08em', textTransform:'uppercase', marginBottom:'1.5rem',
          }}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'var(--g1)',animation:'pulse 2s infinite',display:'inline-block'}}/>
            AI-Powered Medical Imaging
          </div>
          <h1>Visualize Your Health <span className="gradient-text">in 3D</span></h1>
          <p style={{color:'var(--info)',fontSize:'.85rem',fontWeight:500,letterSpacing:'.1em',textTransform:'uppercase',margin:'.8rem 0'}}>
            Powered by AI
          </p>
          <p style={{color:'var(--muted)',maxWidth:480,lineHeight:1.75,marginBottom:'2rem',fontSize:'1rem'}}>
            Transform medical images into interactive 3D visualizations and get
            AI-driven diagnostic insights. Detect diseases, analyze kidney health,
            and generate detailed reports in seconds.
          </p>
          <div style={{display:'flex',gap:'1rem',flexWrap:'wrap',marginBottom:'2.5rem'}}>
            <button className="btn btn-primary" onClick={()=>navigate('/upload')}>Upload Scan →</button>
            <button className="btn btn-outline" onClick={()=>navigate('/insights')}>View Insights</button>
            <button className="btn btn-outline" onClick={()=>navigate('/text3d')}>Text to 3D</button>
          </div>
          {/* stats row */}
          <div style={{display:'flex',gap:'2rem',flexWrap:'wrap'}}>
            {[['98.4%','Accuracy'],['12K+','Scans'],['340ms','Speed'],['3D','Visualization']].map(([n,l])=>(
              <div key={l}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.6rem',fontWeight:800,background:'linear-gradient(135deg,var(--g1),var(--g2))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{n}</div>
                <div style={{fontSize:'.72rem',color:'var(--muted)',marginTop:'.1rem'}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — 3D HUMAN MODEL */}
        <div style={{
          flex:'1', minWidth:300, minHeight:500,
          background:'linear-gradient(135deg, rgba(0,0,0,.5), rgba(0,255,136,.1))',
          border:'1px solid var(--border)',
          borderRadius:24, overflow:'hidden',
          position:'relative',
          boxShadow:'0 8px 32px rgba(0,255,136,.2)',
        }}>
          {/* Animated grid bg */}
          <div style={{
            position:'absolute',inset:0,
            backgroundImage:'linear-gradient(rgba(0,255,136,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,.1) 1px,transparent 1px)',
            backgroundSize:'32px 32px',
            animation:'gridMove 20s linear infinite',
          }}/>
          {/* glow */}
          <div style={{
            position:'absolute',bottom:'-30%',left:'50%',transform:'translateX(-50%)',
            width:400,height:400,
            background:'radial-gradient(circle,rgba(0,200,83,.3),transparent 70%)',
            animation:'pulseGlow 4s ease-in-out infinite',
            pointerEvents:'none',
          }}/>
          <model-viewer
            src="/static/human_base_mesh_male.glb"
            alt="3D Human Body"
            auto-rotate
            camera-controls
            shadow-intensity="0.8"
            environment-image="neutral"
            exposure="1.3"
            camera-orbit="0deg 75deg 2.8m"
            style={{
              width:'100%', height:'100%', minHeight:480,
              background:'transparent',
              '--poster-color':'transparent',
              filter:'drop-shadow(0 0 20px rgba(0,255,136,.3))',
            }}
          >
            {/* Loading slot */}
            <div slot="progress-bar" style={{display:'none'}}></div>
          </model-viewer>
          {/* overlay badge */}
          <div style={{
            position:'absolute',bottom:'1rem',left:'1rem',
            background:'rgba(4,26,10,.9)',
            border:'1px solid rgba(0,255,136,.5)',
            borderRadius:12,padding:'.6rem 1rem',
            backdropFilter:'blur(12px)',
            display:'flex',alignItems:'center',gap:'.6rem',
            boxShadow:'0 4px 16px rgba(0,0,0,.4)',
          }}>
            <div style={{width:8,height:8,borderRadius:'50%',background:'var(--g1)',animation:'pulse 2s infinite'}}/>
            <span style={{fontSize:'.8rem',fontWeight:500}}>Interactive 3D Model</span>
          </div>
          <div style={{
            position:'absolute',top:'1rem',right:'1rem',
            background:'rgba(4,26,10,.8)',
            border:'1px solid var(--border)',
            borderRadius:8,padding:'.3rem .7rem',
            backdropFilter:'blur(10px)',
            fontSize:'.72rem',color:'var(--muted)',
          }}>
            Drag to rotate · Scroll to zoom
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <div style={{padding:'2rem',maxWidth:1200,margin:'0 auto'}}>
        <div style={{borderTop:'1px solid var(--border)',marginBottom:'3rem'}}/>
        <h2 style={{marginBottom:'1.5rem'}}>Everything you need</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'1.2rem'}}>
          {[
            ['🫀','3D Organ Modeling','Upload DICOM or standard medical images and get interactive 3D models with highlighted anomalies.'],
            ['🧠','AI Diagnostics','YOLO model detects kidney stones, tumors, cysts, and more with 98%+ accuracy.'],
            ['📊','Report History','All analyses saved to PostgreSQL — view history, compare scans, track progression.'],
            ['🔬','Trend Analysis','Compare scans over time to track disease progression with visual diff overlays.'],
            ['💬','Text to 3D','Describe anatomy in plain English — Gemini AI generates a 3D model instantly.'],
            ['🔒','Secure & Private','JWT authentication, PostgreSQL storage — your medical data stays yours.'],
          ].map(([icon,title,desc])=>(
            <div key={title} className="card" style={{transition:'all .3s',cursor:'default'}}
              onMouseOver={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.borderColor='rgba(0,255,136,.25)'}}
              onMouseOut={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.borderColor='var(--border)'}}>
              <div style={{width:44,height:44,background:'linear-gradient(135deg,rgba(0,200,83,.2),rgba(0,229,255,.1))',border:'1px solid rgba(0,255,136,.2)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',marginBottom:'1rem'}}>{icon}</div>
              <h3>{title}</h3>
              <p style={{fontSize:'.84rem',color:'var(--muted)',marginTop:'.5rem',lineHeight:1.6}}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
//  INSIGHTS PAGE
// ═══════════════════════════════════════════
export function Insights() {
  const [hoveredBar, setHoveredBar] = React.useState(null)
  const kpis = [
    {label:'Total Cases Analyzed',val:'10,248',change:'↑ 12.4% this month',up:true},
    {label:'Cancer Detection Rate',val:'6.2%',change:'↑ 0.8% vs last year',up:false,color:'var(--danger)'},
    {label:'Avg Confidence Score',val:'93.7%',change:'↑ 2.1% improvement',up:true},
    {label:'False Positive Rate',val:'1.8%',change:'↓ 0.3% reduction',up:true,color:'var(--warn)'},
  ]
  const bars = [
    {label:'Kidney',val:68,count:635,color:'linear-gradient(90deg,var(--g3),var(--g1))'},
    {label:'Lung',val:52,count:487,color:'linear-gradient(90deg,#ff6600,#ff4444)'},
    {label:'Liver',val:38,count:356,color:'linear-gradient(90deg,#0088ff,var(--g2))'},
    {label:'Brain',val:24,count:225,color:'linear-gradient(90deg,#aa00ff,#ff00aa)'},
    {label:'Other',val:15,count:140,color:'rgba(255,255,255,.2)'},
  ]
  return (
    <div className="page-content">
      <div className="section-wrap">
        <h2 style={{marginBottom:'.3rem'}}>Health Insights Dashboard</h2>
        <p style={{color:'var(--muted)',fontSize:'.85rem',marginBottom:'2rem'}}>AI-driven analysis · Updated weekly</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
          {kpis.map(k=>(
            <div key={k.label} className="card">
              <div style={{fontSize:'.78rem',color:'var(--muted)'}}>{k.label}</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:'2rem',fontWeight:800,margin:'.2rem 0',
                ...(k.color?{color:k.color}:{background:'linear-gradient(135deg,var(--g1),var(--g2))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'})}}>
                {k.val}</div>
              <div style={{fontSize:'.75rem',color:k.up?'var(--g1)':'var(--danger)'}}>{k.change}</div>
            </div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.2rem',marginBottom:'1.5rem'}}>
          <div className="card">
            <h3 style={{marginBottom:'1.2rem'}}>Cancer Types Distribution</h3>
            {bars.map(b=>(
              <div key={b.label} style={{display:'flex',alignItems:'center',gap:'.8rem',fontSize:'.78rem',marginBottom:'.6rem'}}
                onMouseEnter={() => setHoveredBar(b)}
                onMouseLeave={() => setHoveredBar(null)}>
                <span style={{width:70,color:'var(--muted)',textAlign:'right'}}>{b.label}</span>
                <div style={{flex:1,height:28,background:'rgba(0,255,136,.05)',borderRadius:4,overflow:'hidden',border:'1px solid var(--border)'}}>
                  <div style={{width:`${b.val}%`,height:'100%',background:b.color,display:'flex',alignItems:'center',paddingLeft:'.5rem',fontSize:'.72rem',fontWeight:600,color:'#020c06'}}>{b.val}%</div>
                </div>
                <span style={{width:40,textAlign:'right'}}>{b.count}</span>
              </div>
            ))}
            {hoveredBar && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: 'var(--dark2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                textAlign: 'center'
              }}>
                <strong>{hoveredBar.label}</strong>: {hoveredBar.count} cases ({hoveredBar.val}% of total)
              </div>
            )}
          </div>
          <div className="card" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
            <h3 style={{marginBottom:'1.2rem',alignSelf:'flex-start'}}>Severity Breakdown</h3>
            <div style={{width:140,height:140,position:'relative',margin:'0 auto'}}>
              <svg style={{transform:'rotate(-90deg)'}} width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="52" fill="none" stroke="rgba(0,255,136,.08)" strokeWidth="16"/>
                <circle cx="70" cy="70" r="52" fill="none" stroke="var(--g1)" strokeWidth="16" strokeDasharray="130.8 196.2"/>
                <circle cx="70" cy="70" r="52" fill="none" stroke="#ffaa00" strokeWidth="16" strokeDasharray="114.5 212.4" strokeDashoffset="-130.8"/>
                <circle cx="70" cy="70" r="52" fill="none" stroke="#ff4444" strokeWidth="16" strokeDasharray="81.7 245.3" strokeDashoffset="-245.3"/>
              </svg>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.6rem',fontWeight:800,background:'linear-gradient(135deg,var(--g1),var(--g2))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>1,843</div>
                <div style={{fontSize:'.65rem',color:'var(--muted)',textTransform:'uppercase'}}>Total</div>
              </div>
            </div>
            <div style={{display:'flex',gap:'1rem',marginTop:'1rem',flexWrap:'wrap',justifyContent:'center'}}>
              {[['var(--g1)','Mild 40%'],['#ffaa00','Moderate 35%'],['#ff4444','Severe 25%']].map(([c,l])=>(
                <span key={l} style={{fontSize:'.75rem',display:'flex',alignItems:'center',gap:'.3rem'}}>
                  <span style={{width:8,height:8,borderRadius:2,background:c,display:'inline-block'}}/>{l}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.2rem'}}>
          <div className="card">
            <h3 style={{marginBottom:'1rem'}}>Age Group Risk</h3>
            {[{l:'18–30',v:15,c:'var(--g3)'},{l:'31–45',v:28,c:'var(--g1)'},{l:'46–60',v:55,c:'#ffaa00'},{l:'60+',v:78,c:'#ff4444'}].map(a=>(
              <div key={a.l} className="result-row">
                <span className="result-label">{a.l}</span>
                <div className="severity-bar"><div className="severity-fill" style={{width:`${a.v}%`,background:a.c}}/></div>
                <span>{a.v}%</span>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 style={{marginBottom:'1rem'}}>Top Conditions</h3>
            {[['Kidney Stones','3,412','badge-yellow'],['Simple Cysts','2,890','badge-blue'],['Hydronephrosis','1,203','badge-yellow'],['RCC (Cancer)','635','badge-red'],['Normal','2,108','badge-green']].map(([l,c,cl])=>(
              <div key={l} className="result-row">
                <span className="result-label">{l}</span>
                <span className={`badge ${cl}`}>{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Charts */}
        <div style={{marginTop:'2rem'}}>
          <h3 style={{marginBottom:'1.5rem', color:'var(--text)'}}>Advanced Analytics</h3>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(400px,1fr))', gap:'1.5rem'}}>
            
            {/* Trend Over Time - Line Chart */}
            <div className="card">
              <h4 style={{marginBottom:'1rem', color:'var(--g1)'}}>📈 Cancer Detection Trends (2023-2024)</h4>
              <div style={{height:'200px', position:'relative'}}>
                <svg width="100%" height="200" viewBox="0 0 400 200" style={{overflow:'visible'}}>
                  <defs>
                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="var(--g3)"/>
                      <stop offset="100%" stopColor="var(--g1)"/>
                    </linearGradient>
                  </defs>
                  <polyline fill="none" stroke="url(#lineGrad)" strokeWidth="3" 
                    points="0,180 50,160 100,140 150,120 200,100 250,80 300,60 350,40 400,20"/>
                  {['Jan','Mar','May','Jul','Sep','Nov'].map((m,i)=>(
                    <text key={i} x={i*66.7} y={195} fontSize="10" fill="var(--muted)" textAnchor="middle">{m}</text>
                  ))}
                  {[20,40,60,80,100,120,140,160,180].map((y,i)=>(
                    <circle key={i} cx={i*50} cy={y} r="4" fill="var(--g1)" style={{filter:'drop-shadow(0 0 4px var(--g1))'}}/>
                  ))}
                </svg>
              </div>
              <div style={{textAlign:'center', marginTop:'1rem', fontSize:'.8rem', color:'var(--muted)'}}>
                Early detection rate improving by 15% YoY
              </div>
            </div>

            {/* Detection Accuracy - Area Chart */}
            <div className="card">
              <h4 style={{marginBottom:'1rem', color:'var(--g1)'}}>🎯 AI Accuracy Over Time</h4>
              <div style={{height:'200px', position:'relative'}}>
                <svg width="100%" height="200" viewBox="0 0 400 200">
                  <defs>
                    <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="var(--g1)" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="var(--g1)" stopOpacity="0.05"/>
                    </linearGradient>
                  </defs>
                  <path d="M0,200 L0,150 Q50,140 100,130 T200,110 T300,90 T400,70 L400,200 Z" 
                        fill="url(#areaGrad)" stroke="var(--g1)" strokeWidth="2"/>
                  <path d="M0,150 Q50,140 100,130 T200,110 T300,90 T400,70" 
                        fill="none" stroke="var(--g1)" strokeWidth="3"/>
                  <text x="200" y="30" textAnchor="middle" fontSize="12" fill="var(--g1)" fontWeight="600">94.2% Avg Accuracy</text>
                </svg>
              </div>
            </div>

            {/* Risk Factors - Stacked Bars */}
            <div className="card">
              <h4 style={{marginBottom:'1rem', color:'var(--g1)'}}>⚠️ Risk Factor Analysis</h4>
              <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                {[
                  {factor:'Smoking', risk:85, color:'#ff4444'},
                  {factor:'Family History', risk:65, color:'#ffaa00'},
                  {factor:'Age >60', risk:55, color:'#ffaa00'},
                  {factor:'Obesity', risk:45, color:'var(--g1)'},
                  {factor:'Diabetes', risk:35, color:'var(--g2)'}
                ].map(r=>(
                  <div key={r.factor} style={{display:'flex', alignItems:'center', gap:'1rem'}}>
                    <span style={{width:'100px', fontSize:'.85rem'}}>{r.factor}</span>
                    <div style={{flex:1, height:'20px', background:'rgba(0,255,136,.1)', borderRadius:'10px', overflow:'hidden'}}>
                      <div style={{
                        width:`${r.risk}%`, 
                        height:'100%', 
                        background:`linear-gradient(90deg, ${r.color}, ${r.color}aa)`,
                        borderRadius:'10px',
                        transition:'width .5s ease'
                      }}/>
                    </div>
                    <span style={{width:'40px', textAlign:'right', fontSize:'.85rem', fontWeight:500}}>{r.risk}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Survival Rates - Comparison */}
            <div className="card">
              <h4 style={{marginBottom:'1rem', color:'var(--g1)'}}>🏥 5-Year Survival Rates</h4>
              <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                {[
                  {stage:'Stage I', rate:92, color:'var(--g1)'},
                  {stage:'Stage II', rate:78, color:'var(--g2)'},
                  {stage:'Stage III', rate:55, color:'#ffaa00'},
                  {stage:'Stage IV', rate:18, color:'#ff4444'}
                ].map(s=>(
                  <div key={s.stage} style={{display:'flex', alignItems:'center', gap:'1rem'}}>
                    <span style={{width:'80px', fontSize:'.85rem'}}>{s.stage}</span>
                    <div style={{flex:1, position:'relative'}}>
                      <div style={{height:'24px', background:'rgba(0,255,136,.1)', borderRadius:'12px'}}>
                        <div style={{
                          width:`${s.rate}%`, 
                          height:'100%', 
                          background:`linear-gradient(90deg, ${s.color}, ${s.color}aa)`,
                          borderRadius:'12px',
                          display:'flex', 
                          alignItems:'center', 
                          paddingLeft:'1rem',
                          fontSize:'.8rem',
                          fontWeight:600,
                          color:'#020c06'
                        }}>
                          {s.rate}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Geographic Distribution */}
            <div className="card">
              <h4 style={{marginBottom:'1rem', color:'var(--g1)'}}>🌍 Regional Distribution</h4>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                {[
                  {region:'North America', cases:2847, color:'var(--g1)'},
                  {region:'Europe', cases:1923, color:'var(--g2)'},
                  {region:'Asia', cases:3456, color:'#0088ff'},
                  {region:'Africa', cases:876, color:'#ffaa00'},
                  {region:'South America', cases:654, color:'#aa00ff'},
                  {region:'Oceania', cases:234, color:'#ff00aa'}
                ].map(r=>(
                  <div key={r.region} style={{
                    padding:'1rem', 
                    border:'1px solid var(--border)', 
                    borderRadius:'8px',
                    background:`linear-gradient(135deg, ${r.color}15, ${r.color}08)`
                  }}>
                    <div style={{fontSize:'.8rem', color:'var(--muted)', marginBottom:'.5rem'}}>{r.region}</div>
                    <div style={{fontSize:'1.5rem', fontWeight:700, color:r.color}}>{r.cases.toLocaleString()}</div>
                    <div style={{fontSize:'.7rem', color:'var(--muted)'}}>cases</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Case Volume */}
            <div className="card">
              <h4 style={{marginBottom:'1rem', color:'var(--g1)'}}>📊 Monthly Case Volume</h4>
              <div style={{height:'200px', position:'relative'}}>
                <svg width="100%" height="200" viewBox="0 0 400 200">
                  <defs>
                    <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 20" fill="none" stroke="rgba(0,255,136,.1)" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="400" height="200" fill="url(#grid)"/>
                  {[30,45,52,48,61,55,67,72,68,75,82,88].map((h,i)=>(
                    <rect key={i} x={i*32} y={200-h*2} width="24" height={h*2} 
                          fill="var(--g1)" rx="2" style={{filter:'drop-shadow(0 2px 4px rgba(0,255,136,.3))'}}/>
                  ))}
                  {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i)=>(
                    <text key={i} x={i*32+12} y={195} fontSize="9" fill="var(--muted)" textAnchor="middle">{m}</text>
                  ))}
                </svg>
              </div>
              <div style={{textAlign:'center', marginTop:'1rem', fontSize:'.8rem', color:'var(--muted)'}}>
                Peak detection in Q3-Q4, consistent growth pattern
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
//  COMPARE PAGE
// ═══════════════════════════════════════════
export function Compare() {
  const [reports, setReports] = React.useState([])
  const [idxA, setIdxA] = React.useState(0)
  const [idxB, setIdxB] = React.useState(1)
  React.useEffect(()=>{
    import('../utils/api').then(({reportsAPI})=>{
      reportsAPI.list().then(r=>setReports(r.data)).catch(()=>{})
    })
  },[])
  const a = reports[idxA]; const b = reports[idxB]
  const sc = s => s==='High'||s==='Severe'?'badge-red':s==='Moderate'?'badge-yellow':'badge-green'
  const Card = ({r,label})=>(
    <div className="card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
        <h3>{label}</h3>
        {r&&<span className="badge badge-blue">{new Date(r.date).toLocaleDateString()}</span>}
      </div>
      {r?(<>
        {(r.detections||[]).map((d,i)=>(
          <div key={i} className="result-row">
            <span className="result-label">{d.label}</span>
            <span className={`badge ${sc(d.severity)}`}>{d.severity}</span>
          </div>
        ))}
        <div className="result-row"><span className="result-label">Overall</span><span className={`badge ${sc(r.overall_severity)}`}>{r.overall_severity}</span></div>
        <div className="result-row"><span className="result-label">Confidence</span><span style={{color:'var(--g1)',fontWeight:600}}>{r.confidence}%</span></div>
      </>):<p style={{color:'var(--muted)',fontSize:'.83rem'}}>Select a report</p>}
    </div>
  )
  return (
    <div className="page-content">
      <div className="section-wrap">
        <h2 style={{marginBottom:'.3rem'}}>Compare Reports</h2>
        <p style={{color:'var(--muted)',fontSize:'.85rem',marginBottom:'2rem'}}>Select two reports to track disease progression.</p>
        {reports.length<2?(
          <div className="alert alert-info"><span>ℹ️</span><span>You need at least 2 saved reports. Upload and analyze more scans first.</span></div>
        ):(
          <>
            <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:'1rem',alignItems:'end',marginBottom:'2rem'}}>
              <div>
                <label>Report A (Baseline)</label>
                <select value={idxA} onChange={e=>setIdxA(+e.target.value)}>
                  {reports.map((r,i)=><option key={r.scan_id} value={i}>{r.scan_id} — {new Date(r.date).toLocaleDateString()}</option>)}
                </select>
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',paddingBottom:'.5rem'}}>
                <div style={{width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,var(--g3),var(--g2))',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'.85rem',color:'#020c06'}}>VS</div>
              </div>
              <div>
                <label>Report B (Latest)</label>
                <select value={idxB} onChange={e=>setIdxB(+e.target.value)}>
                  {reports.map((r,i)=><option key={r.scan_id} value={i}>{r.scan_id} — {new Date(r.date).toLocaleDateString()}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:'1rem'}}>
              <Card r={a} label="Report A"/>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',paddingTop:'3rem',gap:'1rem'}}>
                <div style={{flex:1,width:1,background:'var(--border)'}}/>
                <div style={{width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,var(--g3),var(--g2))',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'.85rem',color:'#020c06'}}>VS</div>
                <div style={{flex:1,width:1,background:'var(--border)'}}/>
              </div>
              <Card r={b} label="Report B"/>
            </div>
            {a&&b&&(
              <div style={{marginTop:'2rem'}}>
                <h3 style={{marginBottom:'1rem',color:'var(--text)'}}>Analysis & Recommendations</h3>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'1rem'}}>
                  <div className="card" style={{border:'1px solid var(--border)',borderRadius:12,padding:'1.5rem'}}>
                    <h4 style={{marginBottom:'1rem',color:'var(--g1)',fontSize:'1rem'}}>📊 Comparison Summary</h4>
                    <ul style={{listStyle:'none',padding:0,margin:0}}>
                      <li style={{marginBottom:'.5rem',fontSize:'.9rem'}}>
                        <strong>Reports:</strong> {a.scan_id} vs {b.scan_id}
                      </li>
                      {a.confidence!==b.confidence&&(
                        <li style={{marginBottom:'.5rem',fontSize:'.9rem'}}>
                          <strong>Confidence:</strong> {a.confidence}% → {b.confidence}%
                        </li>
                      )}
                      {a.overall_severity!==b.overall_severity&&(
                        <li style={{marginBottom:'.5rem',fontSize:'.9rem'}}>
                          <strong>Severity:</strong> {a.overall_severity} → {b.overall_severity}
                        </li>
                      )}
                      {(() => {
                        const stonesA = (a.detections || []).filter(d => d.label === 'Kidney Stone').length;
                        const stonesB = (b.detections || []).filter(d => d.label === 'Kidney Stone').length;
                        const diff = stonesB - stonesA;
                        return diff !== 0 && (
                          <li style={{marginBottom:'.5rem',fontSize:'.9rem'}}>
                            <strong>Kidney Stones:</strong> {stonesA} → {stonesB} ({diff > 0 ? '+' : ''}{diff})
                          </li>
                        );
                      })()}
                    </ul>
                  </div>
                  <div className="card" style={{border:'1px solid var(--border)',borderRadius:12,padding:'1.5rem'}}>
                    <h4 style={{marginBottom:'1rem',color:'var(--g1)',fontSize:'1rem'}}>💡 Recommendations</h4>
                    <ul style={{listStyle:'none',padding:0,margin:0}}>
                      {(() => {
                        const severityWorse = ['Low', 'Moderate', 'High', 'Severe'].indexOf(b.overall_severity) > ['Low', 'Moderate', 'High', 'Severe'].indexOf(a.overall_severity);
                        const stonesA = (a.detections || []).filter(d => d.label === 'Kidney Stone').length;
                        const stonesB = (b.detections || []).filter(d => d.label === 'Kidney Stone').length;
                        const diff = stonesB - stonesA;
                        const recommendations = [];
                        
                        if (severityWorse) {
                          recommendations.push('🔴 Severity has increased - schedule doctor visit immediately');
                        } else if (diff > 0) {
                          recommendations.push('🟡 New kidney stones detected - consult urologist');
                        } else if (diff < 0) {
                          recommendations.push('🟢 Stone count decreased - continue current treatment');
                        } else {
                          recommendations.push('✅ No significant change - continue monitoring');
                        }
                        
                        if (b.confidence > a.confidence + 10) {
                          recommendations.push('📈 AI confidence improved - better scan quality');
                        } else if (b.confidence < a.confidence - 10) {
                          recommendations.push('📉 AI confidence decreased - check scan quality');
                        }
                        
                        recommendations.push('🏥 Always consult physician for clinical interpretation');
                        
                        return recommendations.map((rec, i) => (
                          <li key={i} style={{marginBottom:'.5rem',fontSize:'.9rem',lineHeight:1.4}}>
                            {rec}
                          </li>
                        ));
                      })()}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
//  PRICING PAGE
// ═══════════════════════════════════════════
export function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const plans = [
    {name:'Free',price:'$0',period:'forever',badge:'badge-green',features:[[true,'5 scans/month'],[true,'Basic 3D view'],[true,'AI diagnostic report'],[true,'3 months history'],[false,'Text to 3D'],[false,'PDF export'],[false,'Compare reports']]},
    {name:'Pro',price:'$29',period:'/month',badge:'badge-green',featured:true,features:[[true,'Unlimited scans'],[true,'Full 3D interactive'],[true,'Advanced AI diagnostics'],[true,'Unlimited history'],[true,'Text to 3D (50/mo)'],[true,'PDF export'],[true,'Report comparison']]},
    {name:'Enterprise',price:'Custom',period:'contact us',badge:'badge-blue',features:[[true,'Unlimited everything'],[true,'HIPAA BAA'],[true,'EHR integration'],[true,'Dedicated GPU'],[true,'Text to 3D unlimited'],[true,'SLA 99.9%'],[true,'Custom model training']]},
  ]
  return (
    <div className="page-content">
      <div className="section-wrap" style={{textAlign:'center'}}>
        <h2 style={{marginBottom:'.5rem'}}>Simple, Transparent Pricing</h2>
        <p style={{color:'var(--muted)',fontSize:'.9rem',marginBottom:'3rem'}}>Start free. Upgrade when you need more.</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'1.2rem',maxWidth:900,margin:'0 auto'}}>
          {plans.map(p=>(
            <div key={p.name} style={{
              background:p.featured?'rgba(0,255,136,.06)':'rgba(0,255,136,.03)',
              border:`1px solid ${p.featured?'rgba(0,255,136,.4)':'var(--border)'}`,
              borderRadius:20,padding:'2rem',position:'relative',transition:'transform .3s',
            }}
            onMouseOver={e=>e.currentTarget.style.transform='translateY(-4px)'}
            onMouseOut={e=>e.currentTarget.style.transform='none'}>
              {p.featured&&<div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,var(--g3),var(--g1))',color:'#020c06',fontSize:'.65rem',fontWeight:800,letterSpacing:'.1em',padding:'.25rem .8rem',borderRadius:20}}>POPULAR</div>}
              <span className={`badge ${p.badge}`}>{p.name}</span>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:'2.5rem',fontWeight:800,margin:'1rem 0 .3rem',background:'linear-gradient(135deg,var(--g1),var(--g2))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{p.price}</div>
              <div style={{fontSize:'.8rem',color:'var(--muted)'}}>{p.period}</div>
              <ul style={{listStyle:'none',margin:'1.5rem 0',textAlign:'left'}}>
                {p.features.map(([ok,txt],i)=>(
                  <li key={i} style={{padding:'.5rem 0',fontSize:'.85rem',display:'flex',alignItems:'center',gap:'.6rem',borderBottom:'1px solid rgba(255,255,255,.04)',opacity:ok?1:.5}}>
                    <span style={{color:ok?'var(--g1)':'var(--muted)'}}>{ok?'✓':'✗'}</span>{txt}
                  </li>
                ))}
              </ul>
              <button className={`btn ${p.featured?'btn-primary':'btn-outline'}`} style={{width:'100%',justifyContent:'center'}}
                onClick={() => setSelectedPlan(p)}>
                {p.name==='Enterprise'?'Contact Sales':p.name==='Free'?'Get Started':'Upgrade to Pro'}
              </button>
            </div>
          ))}
        </div>
        {selectedPlan && selectedPlan.name !== 'Free' && selectedPlan.name !== 'Enterprise' && (
          <div style={{maxWidth:500, margin:'2rem auto', padding:'2rem', background:'var(--dark2)', border:'1px solid var(--border)', borderRadius:16, boxShadow:'0 4px 20px rgba(0,0,0,0.3)'}}>
            <h3 style={{color:'var(--text)', marginBottom:'1rem'}}>Payment for {selectedPlan.name}</h3>
            <form style={{display:'grid', gap:'1rem', marginTop:'1rem'}}>
              <input type="text" placeholder="Card Number" style={{padding:'.75rem', border:'1px solid var(--border)', borderRadius:8, background:'var(--dark)', color:'var(--text)', fontSize:'1rem'}} />
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                <input type="text" placeholder="MM/YY" style={{padding:'.75rem', border:'1px solid var(--border)', borderRadius:8, background:'var(--dark)', color:'var(--text)', fontSize:'1rem'}} />
                <input type="text" placeholder="CVV" style={{padding:'.75rem', border:'1px solid var(--border)', borderRadius:8, background:'var(--dark)', color:'var(--text)', fontSize:'1rem'}} />
              </div>
              <input type="text" placeholder="Name on Card" style={{padding:'.75rem', border:'1px solid var(--border)', borderRadius:8, background:'var(--dark)', color:'var(--text)', fontSize:'1rem'}} />
              <button type="submit" className="btn btn-primary" style={{width:'100%', justifyContent:'center', padding:'.75rem', fontSize:'1rem'}}>Pay {selectedPlan.price}{selectedPlan.period}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
