// ═══════════════════════════════════════════
//  HOME PAGE — with interactive 3D human model
// ═══════════════════════════════════════════
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'
import { useToast } from '../utils/ToastContext'
import { queriesAPI } from '../utils/api'
import ModelViewer from '../components/ModelViewer'

export function Home() {
  const navigate = useNavigate()
  const [hoveredStat, setHoveredStat] = useState(null)
  const [hoveredFeature, setHoveredFeature] = useState(null)
  const [hoveredStep, setHoveredStep] = useState(null)
  return (
    <div className="page-content">
      {/* ═══ HERO ═══ */}
      <section style={{
        minHeight:'92vh', display:'flex', alignItems:'center',
        padding:'2rem', maxWidth:1200, margin:'0 auto',
        position:'relative',
      }}>
        {/* Background subtle radial glow */}
        <div style={{position:'absolute',top:'10%',left:'5%',width:500,height:500,background:'radial-gradient(circle,rgba(0,255,136,.06) 0%,transparent 70%)',pointerEvents:'none',filter:'blur(60px)'}}/>
        <div style={{position:'absolute',bottom:'10%',right:'10%',width:400,height:400,background:'radial-gradient(circle,rgba(0,229,255,.05) 0%,transparent 70%)',pointerEvents:'none',filter:'blur(60px)'}}/>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'3rem',alignItems:'center',width:'100%',position:'relative',zIndex:1}}>
          {/* LEFT TEXT */}
          <div>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:'.6rem',
              background:'linear-gradient(135deg, rgba(0,255,136,.1), rgba(0,229,255,.06))',
              border:'1px solid rgba(0,255,136,.25)',
              padding:'.4rem 1.2rem', borderRadius:24,
              fontSize:'.75rem', fontWeight:600, color:'var(--g1)',
              letterSpacing:'.08em', textTransform:'uppercase', marginBottom:'1.8rem',
              backdropFilter:'blur(10px)',
              boxShadow:'0 4px 15px rgba(0,255,136,.15)',
              animation:'fadeIn .6s ease-out',
            }}>
              <span style={{width:7,height:7,borderRadius:'50%',background:'var(--g1)',animation:'pulse 2s infinite',display:'inline-block',boxShadow:'0 0 8px var(--g1)'}}/>
              AI-Powered Medical Imaging
            </div>

            <h1 style={{
              fontSize:'3.5rem',fontWeight:800,fontFamily:"'Syne',sans-serif",
              lineHeight:1.08,marginBottom:'1rem',
              animation:'fadeIn .8s ease-out',
            }}>
              Visualize Your<br/>
              Health{' '}<span style={{
                background:'linear-gradient(135deg, var(--g1), var(--g2), var(--g1))',
                backgroundSize:'200% auto',
                WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
                animation:'shimmer 3s linear infinite',
              }}>in 3D</span>
            </h1>

            <p style={{
              color:'var(--g2)',fontSize:'.8rem',fontWeight:600,letterSpacing:'.12em',
              textTransform:'uppercase',marginBottom:'1.2rem',
              display:'flex',alignItems:'center',gap:'.5rem',
              animation:'fadeIn 1s ease-out',
            }}>
              <span style={{display:'inline-block',animation:'pulse 2s ease-in-out infinite'}}>⚡</span> Powered by AI & Deep Learning
            </p>

            <p style={{color:'var(--muted)',maxWidth:440,lineHeight:1.8,marginBottom:'2rem',fontSize:'.95rem',animation:'fadeIn 1.2s ease-out'}}>
              Transform medical images into interactive 3D visualizations and get
              AI-driven diagnostic insights. Detect diseases, analyze organ health,
              and generate detailed reports — all in seconds.
            </p>

            <div style={{display:'flex',gap:'1rem',flexWrap:'wrap',marginBottom:'2.5rem',animation:'fadeIn 1.4s ease-out'}}>
              <button className="btn btn-primary" onClick={()=>navigate('/upload')} style={{
                padding:'.8rem 2.2rem',borderRadius:14,fontSize:'.9rem',fontWeight:700,
                boxShadow:'0 10px 30px rgba(0,200,83,.35), 0 0 20px rgba(0,255,136,.15)',
                transition:'all .3s cubic-bezier(0.23, 1, 0.320, 1)',
              }}
                onMouseOver={e=>{e.currentTarget.style.transform='translateY(-3px) scale(1.05)';e.currentTarget.style.boxShadow='0 15px 40px rgba(0,200,83,.45), 0 0 30px rgba(0,255,136,.2)'}}
                onMouseOut={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 10px 30px rgba(0,200,83,.35), 0 0 20px rgba(0,255,136,.15)'}}
              >Upload Scan →</button>
              <button className="btn btn-outline" onClick={()=>navigate('/text3d')} style={{
                padding:'.8rem 1.8rem',borderRadius:14,fontSize:'.9rem',
                transition:'all .3s cubic-bezier(0.23, 1, 0.320, 1)',
              }}
                onMouseOver={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 10px 25px rgba(0,229,255,.15)'}}
                onMouseOut={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none'}}
              >Text to 3D ✦</button>
            </div>

            {/* Stats Row */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'.8rem',animation:'fadeIn 1.6s ease-out'}}>
              {[['98.4%','Accuracy','🎯'],['12K+','Scans','📊'],['340ms','Speed','⚡'],['3D','Models','🧬']].map(([n,l,icon],idx)=>(
                <div key={l}
                  onMouseEnter={()=>setHoveredStat(idx)}
                  onMouseLeave={()=>setHoveredStat(null)}
                  style={{
                    background: hoveredStat===idx ? 'linear-gradient(135deg, rgba(0,255,136,.12), rgba(0,229,255,.08))' : 'linear-gradient(135deg, rgba(0,255,136,.05), rgba(0,229,255,.02))',
                    border:'1px solid rgba(0,255,136,.12)',
                    borderRadius:14,padding:'.8rem',
                    backdropFilter:'blur(10px)',
                    transition:'all .4s cubic-bezier(0.23, 1, 0.320, 1)',
                    transform: hoveredStat===idx ? 'translateY(-4px)' : 'none',
                    boxShadow: hoveredStat===idx ? '0 15px 30px rgba(0,255,136,.12)' : 'none',
                    cursor:'default',textAlign:'center',
                    position:'relative',overflow:'hidden',
                  }}>
                  {hoveredStat===idx && <div style={{position:'absolute',top:0,left:'-100%',width:'200%',height:'100%',background:'linear-gradient(90deg, transparent, rgba(0,255,136,.08), transparent)',animation:'shimmer 1.5s ease-out',pointerEvents:'none'}}/>}
                  <div style={{fontSize:'.75rem',marginBottom:'.2rem'}}>{icon}</div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.25rem',fontWeight:800,background:'linear-gradient(135deg,var(--g1),var(--g2))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{n}</div>
                  <div style={{fontSize:'.65rem',color:'var(--muted)',marginTop:'.15rem',textTransform:'uppercase',letterSpacing:'.05em'}}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — 3D HUMAN MODEL */}
          <div style={{
            minHeight:560,
            background:'linear-gradient(135deg, rgba(0,0,0,.5), rgba(0,255,136,.1))',
            border:'1px solid rgba(0,255,136,.2)',
            borderRadius:28, overflow:'hidden',
            position:'relative',
            boxShadow:'0 30px 80px rgba(0,255,136,.18), 0 0 40px rgba(0,255,136,.06), inset 0 1px 0 rgba(255,255,255,.08)',
            transition:'all .5s cubic-bezier(0.23, 1, 0.320, 1)',
            animation:'fadeIn 1s ease-out',
          }}
            onMouseOver={e=>{e.currentTarget.style.boxShadow='0 40px 100px rgba(0,255,136,.25), 0 0 60px rgba(0,255,136,.12), inset 0 1px 0 rgba(255,255,255,.1)';e.currentTarget.style.borderColor='rgba(0,255,136,.35)'}}
            onMouseOut={e=>{e.currentTarget.style.boxShadow='0 30px 80px rgba(0,255,136,.18), 0 0 40px rgba(0,255,136,.06), inset 0 1px 0 rgba(255,255,255,.08)';e.currentTarget.style.borderColor='rgba(0,255,136,.2)'}}
          >
            {/* Animated grid bg */}
            <div style={{
              position:'absolute',inset:0,
              backgroundImage:'linear-gradient(rgba(0,255,136,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,.08) 1px,transparent 1px)',
              backgroundSize:'32px 32px',
              animation:'gridMove 20s linear infinite',
            }}/>
            {/* glow */}
            <div style={{
              position:'absolute',bottom:'-30%',left:'50%',transform:'translateX(-50%)',
              width:400,height:400,
              background:'radial-gradient(circle,rgba(0,200,83,.25),transparent 70%)',
              animation:'pulseGlow 4s ease-in-out infinite',
              pointerEvents:'none',
            }}/>
            <ModelViewer
              src="/static/human_base_mesh_male.glb"
              alt="3D Human Body"
              style={{
                width:'100%', height:'100%', minHeight:560,
                background:'transparent',
                '--poster-color':'transparent',
                filter:'drop-shadow(0 0 25px rgba(0,255,136,.25))',
              }}
            />
            {/* overlay badges */}
            <div style={{
              position:'absolute',bottom:'1rem',left:'1rem',
              background:'rgba(4,26,10,.92)',
              border:'1px solid rgba(0,255,136,.4)',
              borderRadius:12,padding:'.5rem 1rem',
              backdropFilter:'blur(12px)',
              display:'flex',alignItems:'center',gap:'.5rem',
              boxShadow:'0 4px 16px rgba(0,0,0,.4)',
            }}>
              <div style={{width:7,height:7,borderRadius:'50%',background:'var(--g1)',animation:'pulse 2s infinite',boxShadow:'0 0 6px var(--g1)'}}/>
              <span style={{fontSize:'.75rem',fontWeight:500}}>Interactive 3D Model</span>
            </div>
            <div style={{
              position:'absolute',top:'1rem',right:'1rem',
              background:'rgba(4,26,10,.85)',
              border:'1px solid rgba(0,255,136,.15)',
              borderRadius:8,padding:'.3rem .7rem',
              backdropFilter:'blur(10px)',
              fontSize:'.7rem',color:'var(--muted)',
            }}>
              Drag to rotate · Scroll to zoom
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRUSTED BANNER ═══ */}
      <div style={{maxWidth:1200,margin:'0 auto',padding:'0 2rem'}}>
        <div style={{
          background:'linear-gradient(135deg, rgba(0,255,136,.04), rgba(0,229,255,.02))',
          border:'1px solid rgba(0,255,136,.08)',
          borderRadius:20,padding:'1.5rem 2rem',
          display:'flex',alignItems:'center',justifyContent:'center',gap:'3rem',
          flexWrap:'wrap',
          backdropFilter:'blur(10px)',
        }}>
          <span style={{fontSize:'.72rem',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.1em',fontWeight:600}}>Trusted Technologies</span>
          {['🧠 YOLOv8 AI','🔬 DICOM Support','🌐 WebGL 3D','🤖 Gemini Pro','🔒 JWT Secure','💾 PostgreSQL'].map(t=>(
            <span key={t} style={{fontSize:'.78rem',color:'rgba(232,245,233,.5)',fontWeight:500,whiteSpace:'nowrap'}}>{t}</span>
          ))}
        </div>
      </div>

      {/* ═══ HOW IT WORKS ═══ */}
      <div style={{padding:'5rem 2rem 3rem',maxWidth:1200,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:'3rem'}}>
          <span style={{
            display:'inline-block',
            background:'linear-gradient(135deg, rgba(0,229,255,.1), rgba(0,255,136,.06))',
            border:'1px solid rgba(0,229,255,.2)',
            padding:'.3rem 1rem',borderRadius:20,
            fontSize:'.72rem',fontWeight:600,color:'var(--g2)',
            letterSpacing:'.08em',textTransform:'uppercase',marginBottom:'1rem',
          }}>Simple Process</span>
          <h2 style={{
            margin:0,fontSize:'2.2rem',fontWeight:800,fontFamily:"'Syne',sans-serif",
            background:'linear-gradient(135deg, var(--g1), var(--g2))',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
          }}>How It Works</h2>
          <p style={{color:'var(--muted)',fontSize:'.9rem',marginTop:'.6rem'}}>Get results in three simple steps</p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'2rem',position:'relative'}}>
          {/* Connecting line */}
          <div style={{
            position:'absolute',top:'50px',left:'16%',right:'16%',height:2,
            background:'linear-gradient(90deg, rgba(0,255,136,.3), rgba(0,229,255,.3), rgba(0,255,136,.3))',
            borderRadius:2,zIndex:0,
          }}/>
          {[
            ['01','Upload','Upload your medical scan image (X-ray, CT, MRI, DICOM)','📤','var(--g1)'],
            ['02','AI Analysis','Our YOLOv8 model detects anomalies with 98%+ accuracy','🧠','var(--g2)'],
            ['03','3D Results','Get interactive 3D visualization + detailed diagnostic report','🎯','var(--g3)'],
          ].map(([num,title,desc,icon,color],idx)=>(
            <div key={num}
              onMouseEnter={()=>setHoveredStep(idx)}
              onMouseLeave={()=>setHoveredStep(null)}
              style={{
                background: hoveredStep===idx 
                  ? 'linear-gradient(135deg, rgba(0,255,136,.1), rgba(0,229,255,.06))'
                  : 'linear-gradient(135deg, rgba(0,255,136,.04), rgba(0,229,255,.02))',
                border: hoveredStep===idx ? '1px solid rgba(0,255,136,.3)' : '1px solid rgba(0,255,136,.08)',
                borderRadius:22,padding:'2rem',textAlign:'center',
                backdropFilter:'blur(10px)',
                transition:'all .4s cubic-bezier(0.23, 1, 0.320, 1)',
                transform: hoveredStep===idx ? 'translateY(-8px)' : 'none',
                boxShadow: hoveredStep===idx ? '0 25px 50px rgba(0,255,136,.12)' : '0 5px 15px rgba(0,0,0,.1)',
                position:'relative',zIndex:1,
                overflow:'hidden',
              }}>
              {hoveredStep===idx && <div style={{position:'absolute',top:0,left:'-100%',width:'200%',height:'100%',background:'linear-gradient(90deg, transparent, rgba(0,255,136,.06), transparent)',animation:'shimmer 1.5s ease-out',pointerEvents:'none'}}/>}
              {/* Step number circle */}
              <div style={{
                width:60,height:60,borderRadius:'50%',
                background:`linear-gradient(135deg, ${color}, rgba(0,229,255,.8))`,
                display:'flex',alignItems:'center',justifyContent:'center',
                margin:'0 auto 1.2rem',
                fontSize:'1.6rem',
                boxShadow: hoveredStep===idx ? `0 12px 30px rgba(0,255,136,.3)` : `0 8px 20px rgba(0,255,136,.15)`,
                transition:'all .4s',
                transform: hoveredStep===idx ? 'scale(1.1)' : 'none',
              }}>{icon}</div>
              <div style={{
                fontSize:'.65rem',fontWeight:700,color,
                letterSpacing:'.15em',textTransform:'uppercase',marginBottom:'.5rem',
              }}>Step {num}</div>
              <h3 style={{
                fontSize:'1.15rem',fontWeight:700,marginBottom:'.6rem',
                fontFamily:"'Syne',sans-serif",
              }}>{title}</h3>
              <p style={{fontSize:'.83rem',color:'var(--muted)',lineHeight:1.7,margin:0}}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ FEATURES GRID ═══ */}
      <div style={{padding:'2rem 2rem 3rem',maxWidth:1200,margin:'0 auto'}}>
        <div style={{borderTop:'1px solid rgba(0,255,136,.08)',marginBottom:'3rem'}}/>
        <div style={{textAlign:'center',marginBottom:'2.5rem'}}>
          <span style={{
            display:'inline-block',
            background:'linear-gradient(135deg, rgba(0,255,136,.1), rgba(0,229,255,.06))',
            border:'1px solid rgba(0,255,136,.2)',
            padding:'.3rem 1rem',borderRadius:20,
            fontSize:'.72rem',fontWeight:600,color:'var(--g1)',
            letterSpacing:'.08em',textTransform:'uppercase',marginBottom:'1rem',
          }}>Powerful Features</span>
          <h2 style={{
            margin:0,fontSize:'2.2rem',fontWeight:800,fontFamily:"'Syne',sans-serif",
            background:'linear-gradient(135deg, var(--g1), var(--g2))',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
          }}>Everything you need</h2>
          <p style={{color:'var(--muted)',fontSize:'.9rem',marginTop:'.6rem'}}>Advanced AI tools for medical imaging analysis</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1.5rem'}}>
          {[
            ['🫀','3D Organ Modeling','Upload DICOM or standard medical images and get interactive 3D models with highlighted anomalies.'],
            ['🧠','AI Diagnostics','YOLO model detects kidney stones, tumors, cysts, and more with 98%+ accuracy.'],
            ['📊','Report History','All analyses saved to PostgreSQL — view history, compare scans, track progression.'],
            ['🔬','Trend Analysis','Compare scans over time to track disease progression with visual diff overlays.'],
            ['💬','Text to 3D','Describe anatomy in plain English — Gemini AI generates a 3D model instantly.'],
            ['🔒','Secure & Private','JWT authentication, PostgreSQL storage — your medical data stays yours.'],
          ].map(([icon,title,desc],idx)=>(
            <div key={title}
              onMouseEnter={()=>setHoveredFeature(idx)}
              onMouseLeave={()=>setHoveredFeature(null)}
              style={{
                background: hoveredFeature===idx
                  ? 'linear-gradient(135deg, rgba(0,255,136,.1), rgba(0,229,255,.06))'
                  : 'linear-gradient(135deg, rgba(0,255,136,.04), rgba(0,229,255,.02))',
                border: hoveredFeature===idx ? '1px solid rgba(0,255,136,.3)' : '1px solid rgba(0,255,136,.08)',
                borderRadius:20,
                padding:'2rem',
                backdropFilter:'blur(15px)',
                cursor:'default',
                transition:'all .4s cubic-bezier(0.23, 1, 0.320, 1)',
                transform: hoveredFeature===idx ? 'translateY(-8px) scale(1.02)' : 'none',
                boxShadow: hoveredFeature===idx
                  ? '0 25px 60px rgba(0,255,136,.15), 0 0 30px rgba(0,255,136,.08)'
                  : '0 5px 15px rgba(0,0,0,.08)',
                position:'relative',
                overflow:'hidden',
              }}>
              {hoveredFeature===idx && <div style={{
                position:'absolute',top:0,left:'-100%',width:'200%',height:'100%',
                background:'linear-gradient(90deg, transparent, rgba(0,255,136,.06), transparent)',
                animation:'shimmer 1.5s ease-out',pointerEvents:'none'
              }}/>}
              <div style={{
                width:52,height:52,
                background:'linear-gradient(135deg,rgba(0,200,83,.2),rgba(0,229,255,.12))',
                border:'1px solid rgba(0,255,136,.2)',
                borderRadius:16,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:'1.5rem',marginBottom:'1.2rem',
                boxShadow:'0 8px 20px rgba(0,255,136,.1)',
                transition:'all .3s',
                transform: hoveredFeature===idx ? 'scale(1.1) rotate(5deg)' : 'none',
              }}>{icon}</div>
              <h3 style={{
                fontSize:'1.05rem',fontWeight:700,marginBottom:'.5rem',
                fontFamily:"'Syne',sans-serif",
                background: hoveredFeature===idx ? 'linear-gradient(135deg, var(--g1), var(--g2))' : 'none',
                WebkitBackgroundClip: hoveredFeature===idx ? 'text' : 'unset',
                WebkitTextFillColor: hoveredFeature===idx ? 'transparent' : 'var(--text)',
                transition:'all .3s',
              }}>{title}</h3>
              <p style={{fontSize:'.83rem',color:'var(--muted)',marginTop:'.3rem',lineHeight:1.7}}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ CTA BANNER ═══ */}
      <div style={{padding:'2rem 2rem 4rem',maxWidth:1200,margin:'0 auto'}}>
        <div style={{
          background:'linear-gradient(135deg, rgba(0,255,136,.1), rgba(0,229,255,.06))',
          border:'1px solid rgba(0,255,136,.2)',
          borderRadius:28,padding:'4rem 3rem',
          backdropFilter:'blur(20px)',
          textAlign:'center',
          position:'relative',overflow:'hidden',
          boxShadow:'0 30px 80px rgba(0,255,136,.1)',
        }}>
          <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 30% 50%, rgba(0,200,83,.1) 0%, transparent 50%)',pointerEvents:'none'}}/>
          <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 80% 50%, rgba(0,229,255,.08) 0%, transparent 50%)',pointerEvents:'none'}}/>
          <div style={{position:'relative',zIndex:1}}>
            <span style={{fontSize:'3rem',display:'inline-block',animation:'float 3s ease-in-out infinite',marginBottom:'1rem'}}>🚀</span>
            <h2 style={{
              fontSize:'2.2rem',fontWeight:800,fontFamily:"'Syne',sans-serif",
              background:'linear-gradient(135deg, var(--g1), var(--g2))',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
              marginBottom:'.8rem',
            }}>Ready to Transform Your Diagnostics?</h2>
            <p style={{color:'var(--muted)',fontSize:'1rem',maxWidth:500,margin:'0 auto 2rem',lineHeight:1.7}}>
              Start analyzing medical images with AI-powered 3D visualization. Free to get started, no credit card required.
            </p>
            <div style={{display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap'}}>
              <button className="btn btn-primary" onClick={()=>navigate('/upload')} style={{
                padding:'.9rem 2.5rem',borderRadius:14,fontSize:'.95rem',fontWeight:700,
                boxShadow:'0 12px 35px rgba(0,200,83,.4), 0 0 25px rgba(0,255,136,.15)',
                transition:'all .3s cubic-bezier(0.23, 1, 0.320, 1)',
              }}
                onMouseOver={e=>{e.currentTarget.style.transform='translateY(-3px) scale(1.05)';e.currentTarget.style.boxShadow='0 18px 45px rgba(0,200,83,.5), 0 0 35px rgba(0,255,136,.2)'}}
                onMouseOut={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 12px 35px rgba(0,200,83,.4), 0 0 25px rgba(0,255,136,.15)'}}
              >Get Started Free →</button>
              <button className="btn btn-outline" onClick={()=>navigate('/pricing')} style={{
                padding:'.9rem 2rem',borderRadius:14,fontSize:'.95rem',
                transition:'all .3s cubic-bezier(0.23, 1, 0.320, 1)',
              }}
                onMouseOver={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 10px 25px rgba(0,255,136,.15)'}}
                onMouseOut={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none'}}
              >View Pricing</button>
            </div>
          </div>
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
  const [hoveredKPI, setHoveredKPI] = React.useState(null)
  const kpis = [
    {label:'Total Cases Analyzed',val:'10,248',change:'↑ 12.4% this month',up:true,icon:'📊'},
    {label:'Cancer Detection Rate',val:'6.2%',change:'↑ 0.8% vs last year',up:false,color:'var(--danger)',icon:'🎯'},
    {label:'False Positive Rate',val:'1.8%',change:'↓ 0.3% reduction',up:true,color:'var(--warn)',icon:'⚡'},
  ]
  const bars = [
    {label:'Kidney',val:68,count:635,color:'linear-gradient(90deg,var(--g3),var(--g1))'},
    {label:'Lung',val:52,count:487,color:'linear-gradient(90deg,#ff6600,#ff4444)'},
    {label:'Liver',val:38,count:356,color:'linear-gradient(90deg,#0088ff,var(--g2))'},
    {label:'Brain',val:24,count:225,color:'linear-gradient(90deg,#aa00ff,#ff00aa)'},
    {label:'Other',val:15,count:140,color:'rgba(255,255,255,.2)'},
  ]
  return (
    <div
      className="page-content"
      style={{
        '--g1':'#2dd4bf',
        '--g2':'#38bdf8',
        '--g3':'#34d399',
        '--border':'rgba(45,212,191,.24)',
        '--card':'rgba(45,212,191,.06)',
        '--muted':'rgba(216,243,255,.68)',
      }}
    >
      <div className="section-wrap">
        {/* Enhanced Header */}
        <div style={{marginBottom:'3rem'}}>
          <div style={{
            background:'linear-gradient(155deg, rgba(0,255,136,.06), rgba(0,229,255,.03))',
            border:'1px solid rgba(0,255,136,.18)',
            borderRadius:'24px',
            padding:'2.5rem',
            backdropFilter:'blur(14px)',
            position:'relative',
            overflow:'hidden',
            transform:'translateZ(0)',
            boxShadow:'0 16px 36px rgba(0,255,136,.08), inset 0 1px 0 rgba(255,255,255,.06)'
          }}>
            {/* Softer texture overlay */}
            <div style={{
              position:'absolute',
              inset:0,
              background:'radial-gradient(circle at 12% 40%, rgba(0,255,136,.12) 0%, transparent 52%), radial-gradient(circle at 86% 28%, rgba(0,229,255,.08) 0%, transparent 46%)',
              opacity:.7,
              pointerEvents:'none'
            }}/>
            <div style={{
              position:'absolute',
              inset:0,
              backgroundImage:'linear-gradient(rgba(0,255,136,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,.04) 1px, transparent 1px)',
              backgroundSize:'26px 26px',
              opacity:.22,
              pointerEvents:'none'
            }}/>
            {/* Content */}
            <div style={{position:'relative',zIndex:1}}>
              <div style={{
                display:'flex',
                alignItems:'center',
                gap:'1rem',
                marginBottom:'1rem'
              }}>
                <span style={{
                  fontSize:'2rem',
                  animation:'float 3s ease-in-out infinite',
                  display:'inline-block'
                }}>📈</span>
                <h1 style={{
                  margin:0,
                  background:'linear-gradient(135deg, var(--g1), var(--g2))',
                  WebkitBackgroundClip:'text',
                  WebkitTextFillColor:'transparent',
                  fontSize:'2.4rem',
                  fontWeight:800,
                  fontFamily:"'Poppins',sans-serif",
                  letterSpacing:'.02em'
                }}>Health Insights Dashboard</h1>
              </div>
              <p style={{
                color:'var(--muted)',
                fontSize:'.95rem',
                margin:0,
                letterSpacing:'.05em'
              }}>🤖 AI-driven analysis • 📊 Real-time metrics • 🎯 Updated weekly</p>
            </div>
          </div>
        </div>

        {/* KPI Cards Grid - Enhanced with 3D Effects */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'1.2rem',marginBottom:'2.5rem'}}>
          {kpis.map((k,i)=>(
            <div 
              key={k.label}
              onMouseEnter={() => setHoveredKPI(i)}
              onMouseLeave={() => setHoveredKPI(null)}
              style={{
                background:'linear-gradient(135deg, rgba(0,255,136,.08), rgba(0,229,255,.04))',
                border:'1px solid rgba(0,255,136,.15)',
                borderRadius:'16px',
                padding:'1.8rem',
                backdropFilter:'blur(15px)',
                cursor:'pointer',
                transition:'all .4s cubic-bezier(0.23, 1, 0.320, 1)',
                transform: hoveredKPI === i ? 'translateY(-8px) scale(1.02)' : 'none',
                boxShadow: hoveredKPI === i 
                  ? '0 30px 60px rgba(0,255,136,.15), inset 0 1px 0 rgba(255,255,255,.1)'
                  : '0 10px 30px rgba(0,255,136,.05), inset 0 1px 0 rgba(255,255,255,.08)',
                position:'relative',
                overflow:'hidden'
              }}>
              {/* Shine effect */}
              <div style={{
                position:'absolute',
                top:'-50%',
                left:'-50%',
                width:'200%',
                height:'200%',
                background:'linear-gradient(135deg, transparent, rgba(255,255,255,.1), transparent)',
                transform:'rotate(45deg)',
                animation: hoveredKPI === i ? 'shimmer 0.6s' : 'none',
                pointerEvents:'none'
              }}/>
              
              <div style={{position:'relative',zIndex:1}}>
                <div style={{
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'space-between',
                  marginBottom:'1rem'
                }}>
                  <span style={{fontSize:'.85rem',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:600}}>
                    {k.label}
                  </span>
                  <span style={{fontSize:'1.45rem'}}>
                    {k.icon}
                  </span>
                </div>
                <div style={{
                  fontFamily:"'Poppins',sans-serif",
                  fontSize:'2.2rem',
                  fontWeight:800,
                  margin:'.5rem 0',
                  background:'linear-gradient(135deg, var(--g1), var(--g2))',
                  WebkitBackgroundClip:'text',
                  WebkitTextFillColor:'transparent',
                  ...(k.color && {background:'none',WebkitTextFillColor:'unset',color:k.color})
                }}>
                  {k.val}
                </div>
                <div style={{
                  fontSize:'.8rem',
                  color:k.up?'var(--g1)':'var(--danger)',
                  fontWeight:600,
                  letterSpacing:'.02em'
                }}>
                  {k.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem',marginBottom:'1.5rem'}}>
          {/* Cancer Distribution Card */}
          <div style={{
            background:'linear-gradient(135deg, rgba(0,255,136,.06), rgba(0,229,255,.03))',
            border:'1px solid rgba(0,255,136,.15)',
            borderRadius:'20px',
            padding:'2rem',
            backdropFilter:'blur(15px)',
            boxShadow:'0 15px 40px rgba(0,255,136,.08)',
            position:'relative',
            overflow:'hidden'
          }}>
            <h3 style={{
              marginBottom:'1.5rem',
              background:'linear-gradient(135deg, var(--g1), var(--g2))',
              WebkitBackgroundClip:'text',
              WebkitTextFillColor:'transparent',
              fontSize:'1.3rem',
              fontWeight:700
            }}>🔬 Cancer Types Distribution</h3>
            {bars.map((b,idx)=>(
              <div 
                key={b.label} 
                style={{
                  display:'flex',alignItems:'center',gap:'.8rem',fontSize:'.78rem',marginBottom:'1rem',
                  transition:'all .3s',
                  transform: hoveredBar === b ? 'translateX(6px)' : 'none'
                }}
                onMouseEnter={() => setHoveredBar(b)}
                onMouseLeave={() => setHoveredBar(null)}>
                <span style={{width:70,color:'var(--muted)',textAlign:'right',fontWeight:600}}>{b.label}</span>
                <div style={{
                  flex:1,height:32,background:'rgba(0,255,136,.08)',borderRadius:8,overflow:'hidden',
                  border:'1px solid rgba(0,255,136,.15)',
                  boxShadow:'inset 0 2px 8px rgba(0,0,0,.3)'
                }}>
                  <div style={{
                    width:`${b.val}%`,height:'100%',background:b.color,display:'flex',alignItems:'center',
                    paddingLeft:'.8rem',fontSize:'.75rem',fontWeight:700,color:'#020c06',
                    boxShadow:'0 0 20px rgba(0,255,136,.4)',
                    transition:'all .4s cubic-bezier(0.23, 1, 0.320, 1)'
                  }}>{b.val}%</div>
                </div>
                <span style={{width:40,textAlign:'right',fontWeight:600,color:'var(--g1)'}}>{b.count}</span>
              </div>
            ))}
            {hoveredBar && (
              <div style={{
                marginTop:'1.5rem',
                padding:'1.2rem',
                background:'linear-gradient(135deg, rgba(0,255,136,.12), rgba(0,229,255,.06))',
                border:'1px solid rgba(0,255,136,.2)',
                borderRadius:'12px',
                textAlign:'center',
                animation:'slideIn .3s ease-out',
                boxShadow:'0 10px 30px rgba(0,255,136,.1)'
              }}>
                <strong style={{fontSize:'1.1rem',color:'var(--g1)'}}>{hoveredBar.label}</strong>
                <div style={{color:'var(--muted)',fontSize:'.85rem',marginTop:'.3rem'}}>
                  {hoveredBar.count} cases ({hoveredBar.val}% of total)
                </div>
              </div>
            )}
          </div>

          {/* Severity Chart Card */}
          <div style={{
            background:'linear-gradient(135deg, rgba(0,255,136,.06), rgba(0,229,255,.03))',
            border:'1px solid rgba(0,255,136,.15)',
            borderRadius:'20px',
            padding:'2rem',
            backdropFilter:'blur(15px)',
            boxShadow:'0 15px 40px rgba(0,255,136,.08)',
            display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
            position:'relative',
            overflow:'hidden'
          }}>
            <h3 style={{
              marginBottom:'1.5rem',
              alignSelf:'flex-start',
              background:'linear-gradient(135deg, var(--g1), var(--g2))',
              WebkitBackgroundClip:'text',
              WebkitTextFillColor:'transparent',
              fontSize:'1.3rem',
              fontWeight:700
            }}>📊 Severity Breakdown</h3>
            <div style={{width:160,height:160,position:'relative',margin:'1rem auto 0'}}>
              <svg 
                style={{
                  transform:'rotate(-90deg)',
                  filter:'drop-shadow(0 15px 35px rgba(0,255,136,.15))'
                }} 
                width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="60" fill="none" stroke="rgba(0,255,136,.08)" strokeWidth="18"/>
                <circle cx="80" cy="80" r="60" fill="none" stroke="var(--g1)" strokeWidth="18" strokeDasharray="150.8 226.2" style={{filter:'drop-shadow(0 0 10px var(--g1))'}}/>
                <circle cx="80" cy="80" r="60" fill="none" stroke="#ffaa00" strokeWidth="18" strokeDasharray="132.5 244.4" strokeDashoffset="-150.8" style={{filter:'drop-shadow(0 0 8px #ffaa00)'}}/>
                <circle cx="80" cy="80" r="60" fill="none" stroke="#ff4444" strokeWidth="18" strokeDasharray="94.7 282.3" strokeDashoffset="-283.3" style={{filter:'drop-shadow(0 0 8px #ff4444)'}}/>
              </svg>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                <div style={{
                  fontFamily:"'Syne',sans-serif",fontSize:'1.9rem',fontWeight:800,
                  background:'linear-gradient(135deg, var(--g1), var(--g2))',
                  WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'
                }}>1,843</div>
                <div style={{fontSize:'.7rem',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.1em'}}>Total Cases</div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'.8rem',marginTop:'1.8rem',width:'100%'}}>
              {[{c:'var(--g1)',l:'Mild',p:'40%'},{c:'#ffaa00',l:'Moderate',p:'35%'},{c:'#ff4444',l:'Severe',p:'25%'}].map(x=>(
                <div key={x.l} style={{textAlign:'center',padding:'.8rem',background:'rgba(0,255,136,.05)',borderRadius:'10px',border:'1px solid rgba(0,255,136,.1)'}}>
                  <div style={{width:12,height:12,borderRadius:3,background:x.c,margin:'0 auto .5rem',boxShadow:`0 0 12px ${x.c}`}}/>
                  <div style={{fontSize:'.75rem',color:'var(--muted)',fontWeight:600}}>{x.l}</div>
                  <div style={{fontSize:'.9rem',color:x.c,fontWeight:700,marginTop:'.2rem'}}>{x.p}</div>
                </div>
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
  const [hoveredCard, setHoveredCard] = React.useState(null)
  const Card = ({r,label,id})=>(
    <div 
      style={{
        background:'linear-gradient(135deg, rgba(0,255,136,.06), rgba(0,229,255,.03))',
        border: hoveredCard===id ? '1px solid rgba(0,255,136,.35)' : '1px solid rgba(0,255,136,.12)',
        borderRadius:20,
        padding:'1.8rem',
        backdropFilter:'blur(15px)',
        transition:'all .4s cubic-bezier(0.23, 1, 0.320, 1)',
        transform: hoveredCard===id ? 'translateY(-6px) scale(1.02)' : 'none',
        boxShadow: hoveredCard===id ? '0 25px 60px rgba(0,255,136,.15)' : '0 8px 25px rgba(0,255,136,.05)',
        position:'relative',
        overflow:'hidden'
      }}
      onMouseEnter={()=>setHoveredCard(id)}
      onMouseLeave={()=>setHoveredCard(null)}
    >
      {hoveredCard===id && <div style={{
        position:'absolute',top:0,left:'-100%',width:'200%',height:'100%',
        background:'linear-gradient(90deg, transparent, rgba(0,255,136,.06), transparent)',
        animation:'shimmer 1.5s ease-out',pointerEvents:'none'
      }}/>}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.2rem'}}>
        <h3 style={{
          margin:0,fontSize:'1.1rem',
          background:'linear-gradient(135deg, var(--g1), var(--g2))',
          WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontWeight:700
        }}>{label}</h3>
        {r&&<span style={{
          fontSize:'.72rem',padding:'.25rem .7rem',borderRadius:8,
          background:'rgba(0,229,255,.12)',border:'1px solid rgba(0,229,255,.25)',color:'var(--g2)',fontWeight:600
        }}>{new Date(r.date).toLocaleDateString()}</span>}
      </div>
      {r?(<>
        {(r.detections||[]).map((d,i)=>(
          <div key={i} style={{
            display:'flex',justifyContent:'space-between',alignItems:'center',
            padding:'.7rem .9rem',background:'rgba(0,255,136,.04)',
            border:'1px solid rgba(0,255,136,.08)',borderRadius:10,marginBottom:'.5rem',
            transition:'all .2s'
          }}>
            <span style={{fontWeight:600,fontSize:'.85rem'}}>{d.label}</span>
            <span className={`badge ${sc(d.severity)}`}>{d.severity}</span>
          </div>
        ))}
        <div style={{
          display:'flex',justifyContent:'space-between',alignItems:'center',
          padding:'.7rem .9rem',background:'rgba(0,255,136,.06)',
          border:'1px solid rgba(0,255,136,.12)',borderRadius:10,marginBottom:'.5rem'
        }}><span style={{fontWeight:600,fontSize:'.85rem',color:'var(--muted)'}}>Overall</span><span className={`badge ${sc(r.overall_severity)}`}>{r.overall_severity}</span></div>
        <div style={{
          display:'flex',justifyContent:'space-between',alignItems:'center',
          padding:'.7rem .9rem',background:'rgba(0,255,136,.06)',
          border:'1px solid rgba(0,255,136,.12)',borderRadius:10
        }}><span style={{fontWeight:600,fontSize:'.85rem',color:'var(--muted)'}}>Confidence</span><span style={{color:'var(--g1)',fontWeight:700,fontSize:'1rem'}}>{r.confidence}%</span></div>
      </>):<p style={{color:'var(--muted)',fontSize:'.83rem',textAlign:'center',padding:'2rem 0'}}>Select a report</p>}
    </div>
  )
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
            background:'radial-gradient(circle at 20% 50%, rgba(0,229,255,.1) 0%, transparent 50%)',
            pointerEvents:'none'
          }}/>
          <div style={{position:'relative',zIndex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'.8rem'}}>
              <span style={{fontSize:'2rem',animation:'float 3s ease-in-out infinite',display:'inline-block'}}>⚖️</span>
              <h1 style={{
                margin:0,
                background:'linear-gradient(135deg, var(--g1), var(--g2))',
                WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
                fontSize:'2.2rem',fontWeight:800,fontFamily:"'Syne',sans-serif"
              }}>Compare Reports</h1>
            </div>
            <p style={{color:'var(--muted)',fontSize:'.9rem',margin:0}}>Select two reports to track disease progression</p>
          </div>
        </div>

        {reports.length<2?(
          <div style={{
            background:'linear-gradient(135deg, rgba(0,229,255,.08), rgba(0,255,136,.05))',
            border:'1px solid rgba(0,229,255,.2)',
            borderRadius:16,padding:'1.5rem',
            display:'flex',alignItems:'center',gap:'.8rem',
            backdropFilter:'blur(10px)'
          }}><span>ℹ️</span><span style={{color:'var(--muted)'}}>You need at least 2 saved reports. Upload and analyze more scans first.</span></div>
        ):(
          <>
            {/* Selector Row */}
            <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:'1.5rem',alignItems:'end',marginBottom:'2rem'}}>
              <div>
                <label style={{
                  display:'block',marginBottom:'.5rem',fontSize:'.8rem',
                  color:'var(--g1)',fontWeight:600,letterSpacing:'.08em',textTransform:'uppercase'
                }}>Report A (Baseline)</label>
                <select value={idxA} onChange={e=>setIdxA(+e.target.value)} style={{
                  width:'100%',padding:'.7rem 1rem',
                  background:'rgba(0,255,136,.05)',
                  border:'1px solid rgba(0,255,136,.2)',
                  borderRadius:12,color:'var(--text)',
                  backdropFilter:'blur(10px)',
                  outline:'none',
                  transition:'all .3s',
                  fontSize:'.85rem'
                }}>
                  {reports.map((r,i)=><option key={r.scan_id} value={i}>{r.scan_id} — {new Date(r.date).toLocaleDateString()}</option>)}
                </select>
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',paddingBottom:'.5rem'}}>
                <div style={{
                  width:52,height:52,borderRadius:'50%',
                  background:'linear-gradient(135deg,var(--g3),var(--g2))',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'.9rem',color:'#020c06',
                  boxShadow:'0 8px 25px rgba(0,200,83,.35), 0 0 20px rgba(0,255,136,.2)',
                  animation:'pulse 2s ease-in-out infinite'
                }}>VS</div>
              </div>
              <div>
                <label style={{
                  display:'block',marginBottom:'.5rem',fontSize:'.8rem',
                  color:'var(--g2)',fontWeight:600,letterSpacing:'.08em',textTransform:'uppercase'
                }}>Report B (Latest)</label>
                <select value={idxB} onChange={e=>setIdxB(+e.target.value)} style={{
                  width:'100%',padding:'.7rem 1rem',
                  background:'rgba(0,255,136,.05)',
                  border:'1px solid rgba(0,255,136,.2)',
                  borderRadius:12,color:'var(--text)',
                  backdropFilter:'blur(10px)',
                  outline:'none',
                  transition:'all .3s',
                  fontSize:'.85rem'
                }}>
                  {reports.map((r,i)=><option key={r.scan_id} value={i}>{r.scan_id} — {new Date(r.date).toLocaleDateString()}</option>)}
                </select>
              </div>
            </div>

            {/* Cards Comparison */}
            <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:'1.5rem'}}>
              <Card r={a} label="Report A" id="a"/>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',paddingTop:'3rem',gap:'1rem'}}>
                <div style={{flex:1,width:2,background:'linear-gradient(to bottom, rgba(0,255,136,.3), transparent)',borderRadius:2}}/>
                <div style={{
                  width:48,height:48,borderRadius:'50%',
                  background:'linear-gradient(135deg,var(--g3),var(--g2))',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'.85rem',color:'#020c06',
                  boxShadow:'0 8px 25px rgba(0,200,83,.35), 0 0 20px rgba(0,255,136,.2)'
                }}>VS</div>
                <div style={{flex:1,width:2,background:'linear-gradient(to bottom, transparent, rgba(0,255,136,.3))',borderRadius:2}}/>
              </div>
              <Card r={b} label="Report B" id="b"/>
            </div>

            {/* Analysis & Recommendations */}
            {a&&b&&(
              <div style={{marginTop:'2.5rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:'.8rem',marginBottom:'1.5rem'}}>
                  <span style={{fontSize:'1.3rem',animation:'pulse 2s ease-in-out infinite'}}>🔬</span>
                  <h3 style={{
                    margin:0,
                    background:'linear-gradient(135deg, var(--g1), var(--g2))',
                    WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
                    fontSize:'1.3rem',fontWeight:700
                  }}>Analysis & Recommendations</h3>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'1.5rem'}}>
                  {/* Comparison Summary Card */}
                  <div style={{
                    background:'linear-gradient(135deg, rgba(0,255,136,.06), rgba(0,229,255,.03))',
                    border:'1px solid rgba(0,255,136,.15)',
                    borderRadius:20,padding:'1.8rem',
                    backdropFilter:'blur(15px)',
                    boxShadow:'0 8px 25px rgba(0,255,136,.06)',
                    transition:'all .3s',
                    position:'relative',overflow:'hidden'
                  }}
                    onMouseOver={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 20px 50px rgba(0,255,136,.12)'}}
                    onMouseOut={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 8px 25px rgba(0,255,136,.06)'}}
                  >
                    <h4 style={{
                      marginBottom:'1.2rem',fontSize:'1rem',
                      background:'linear-gradient(135deg, var(--g1), var(--g2))',
                      WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
                      fontWeight:700
                    }}>📊 Comparison Summary</h4>
                    <ul style={{listStyle:'none',padding:0,margin:0}}>
                      <li style={{
                        marginBottom:'.6rem',fontSize:'.88rem',
                        padding:'.5rem .7rem',background:'rgba(0,255,136,.04)',
                        borderRadius:8,border:'1px solid rgba(0,255,136,.08)'
                      }}>
                        <strong style={{color:'var(--g1)'}}>Reports:</strong> {a.scan_id} vs {b.scan_id}
                      </li>
                      {a.confidence!==b.confidence&&(
                        <li style={{
                          marginBottom:'.6rem',fontSize:'.88rem',
                          padding:'.5rem .7rem',background:'rgba(0,255,136,.04)',
                          borderRadius:8,border:'1px solid rgba(0,255,136,.08)'
                        }}>
                          <strong style={{color:'var(--g1)'}}>Confidence:</strong> {a.confidence}% → {b.confidence}%
                        </li>
                      )}
                      {a.overall_severity!==b.overall_severity&&(
                        <li style={{
                          marginBottom:'.6rem',fontSize:'.88rem',
                          padding:'.5rem .7rem',background:'rgba(0,255,136,.04)',
                          borderRadius:8,border:'1px solid rgba(0,255,136,.08)'
                        }}>
                          <strong style={{color:'var(--g1)'}}>Severity:</strong> {a.overall_severity} → {b.overall_severity}
                        </li>
                      )}
                      {(() => {
                        const stonesA = (a.detections || []).filter(d => d.label === 'Kidney Stone').length;
                        const stonesB = (b.detections || []).filter(d => d.label === 'Kidney Stone').length;
                        const diff = stonesB - stonesA;
                        return diff !== 0 && (
                          <li style={{
                            marginBottom:'.6rem',fontSize:'.88rem',
                            padding:'.5rem .7rem',background:'rgba(0,255,136,.04)',
                            borderRadius:8,border:'1px solid rgba(0,255,136,.08)'
                          }}>
                            <strong style={{color:'var(--g1)'}}>Kidney Stones:</strong> {stonesA} → {stonesB} ({diff > 0 ? '+' : ''}{diff})
                          </li>
                        );
                      })()}
                    </ul>
                  </div>
                  {/* Recommendations Card */}
                  <div style={{
                    background:'linear-gradient(135deg, rgba(0,229,255,.06), rgba(0,255,136,.03))',
                    border:'1px solid rgba(0,229,255,.15)',
                    borderRadius:20,padding:'1.8rem',
                    backdropFilter:'blur(15px)',
                    boxShadow:'0 8px 25px rgba(0,229,255,.06)',
                    transition:'all .3s',
                    position:'relative',overflow:'hidden'
                  }}
                    onMouseOver={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 20px 50px rgba(0,229,255,.12)'}}
                    onMouseOut={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 8px 25px rgba(0,229,255,.06)'}}
                  >
                    <h4 style={{
                      marginBottom:'1.2rem',fontSize:'1rem',
                      background:'linear-gradient(135deg, var(--g2), var(--g1))',
                      WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
                      fontWeight:700
                    }}>💡 Recommendations</h4>
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
                          <li key={i} style={{
                            marginBottom:'.6rem',fontSize:'.88rem',lineHeight:1.5,
                            padding:'.5rem .7rem',
                            background:'rgba(0,229,255,.04)',
                            borderRadius:8,
                            border:'1px solid rgba(0,229,255,.08)',
                            transition:'all .2s'
                          }}
                            onMouseOver={e=>e.currentTarget.style.background='rgba(0,229,255,.08)'}
                            onMouseOut={e=>e.currentTarget.style.background='rgba(0,229,255,.04)'}
                          >
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
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const priceText = {
    textShadow:'0 1px 0 rgba(0,0,0,.25), 0 8px 18px rgba(0,0,0,.25)',
    letterSpacing:'.01em'
  }
  
  const plans = [
    {name:'Free',price:'$0',period:'forever',badge:'badge-green',features:[[true,'10 scans/day'],[true,'10 text-to-3D/day'],[true,'Basic 3D view'],[true,'AI diagnostic report'],[true,'30 days history'],[false,'PDF export'],[false,'Compare reports'],[false,'Priority support']]},
    {name:'Pro',price:'$29',period:'/month',badge:'badge-green',featured:true,features:[[true,'Unlimited scans'],[true,'Unlimited text-to-3D'],[true,'Full 3D interactive'],[true,'Advanced AI diagnostics'],[true,'Unlimited history'],[true,'PDF export'],[true,'Report comparison'],[true,'Priority support']]},
    {name:'Enterprise',price:'Custom',period:'contact us',badge:'badge-blue',features:[[true,'Unlimited everything'],[true,'HIPAA BAA'],[true,'EHR integration'],[true,'Dedicated GPU'],[true,'Text to 3D unlimited'],[true,'SLA 99.9%'],[true,'Custom model training'],[true,'Dedicated support']]},
  ]
  
  return (
    <div className="page-content">
      <div className="section-wrap" style={{textAlign:'center', maxWidth:1080}}>
        <div style={{
          background:'linear-gradient(135deg, rgba(0,255,136,.08), rgba(0,229,255,.05))',
          border:'1px solid rgba(0,255,136,.15)',
          borderRadius:'24px',
          padding:'2.3rem',
          backdropFilter:'blur(16px)',
          position:'relative',
          overflow:'hidden',
          marginBottom:'2rem',
          boxShadow:'0 20px 60px rgba(0,255,136,.1), inset 0 1px 0 rgba(255,255,255,.1)'
        }}>
          <div style={{
            position:'absolute',inset:0,
            background:'radial-gradient(circle at 20% 50%, rgba(0,229,255,.1) 0%, transparent 50%)',
            pointerEvents:'none'
          }}/>
          <div style={{position:'relative',zIndex:1}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'.9rem',marginBottom:'.8rem'}}>
              <span style={{fontSize:'1.9rem',display:'inline-block'}}>💳</span>
              <h1 style={{
                margin:0,
                background:'linear-gradient(135deg, var(--g1), var(--g2))',
                WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
                fontSize:'2.2rem',fontWeight:800,fontFamily:"'Syne',sans-serif"
              }}>Simple, Transparent Pricing</h1>
            </div>
            <p style={{color:'var(--muted)',fontSize:'.95rem',margin:0}}>Start free today. Upgrade anytime for more features.</p>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'1.2rem',maxWidth:980,margin:'0 auto',alignItems:'stretch'}}>
          {plans.map(p=>(
            <div key={p.name} style={{
              background:p.featured?'rgba(0,255,136,.06)':'rgba(0,255,136,.03)',
              border:`1px solid ${p.featured?'rgba(0,255,136,.4)':'var(--border)'}`,
              borderRadius:20,padding:'2rem',position:'relative',transition:'transform .3s',
              display:'flex',flexDirection:'column',height:'100%',
            }}
            onMouseOver={e=>e.currentTarget.style.transform='translateY(-4px)'}
            onMouseOut={e=>e.currentTarget.style.transform='none'}>
              {p.featured&&<div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,var(--g3),var(--g1))',color:'#020c06',fontSize:'.65rem',fontWeight:800,letterSpacing:'.1em',padding:'.25rem .8rem',borderRadius:20}}>POPULAR</div>}
              <span className={`badge ${p.badge}`}>{p.name}</span>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:'2.5rem',fontWeight:800,margin:'1rem 0 .3rem',background:'linear-gradient(135deg,var(--g1),var(--g2))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent', ...priceText}}>{p.price}</div>
              <div style={{fontSize:'.8rem',color:'var(--muted)'}}>{p.period}</div>
              
              <ul style={{listStyle:'none',margin:'1.5rem 0',textAlign:'left',flex:1}}>
                {p.features.map(([ok,txt],i)=>(
                  <li key={i} style={{padding:'.5rem 0',fontSize:'.85rem',display:'flex',alignItems:'center',gap:'.6rem',borderBottom:'1px solid rgba(255,255,255,.04)',opacity:ok?1:.5}}>
                    <span style={{color:ok?'var(--g1)':'var(--muted)'}}>{ok?'✓':'✗'}</span>{txt}
                  </li>
                ))}
              </ul>
              
              {user?.plan === p.name.toLowerCase() ? (
                <button className="btn btn-outline" style={{width:'100%',justifyContent:'center',opacity:0.6,cursor:'default'}}>
                  ✓ Current Plan
                </button>
              ) : (
                <button className={`btn ${p.featured?'btn-primary':'btn-outline'}`} style={{width:'100%',justifyContent:'center'}}
                  disabled
                  title="Contact us for premium plans"
                >
                  {p.name==='Enterprise'?'Contact Sales':p.name==='Free'?'Get Started':'Coming Soon'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
//  ABOUT PAGE
// ═══════════════════════════════════════════
export function About() {
  const toast = useToast()
  const [scrollY, setScrollY] = React.useState(0)
  const [query, setQuery] = React.useState({ name:'', email:'', message:'' })
  const [savingQuery, setSavingQuery] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY || 0)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const orbShiftA = Math.min(scrollY * 0.12, 120)
  const orbShiftB = Math.min(scrollY * 0.16, 180)

  const updateQuery = (field, value) => {
    setQuery(prev => ({ ...prev, [field]: value }))
  }

  const submitQuery = async (e) => {
    e.preventDefault()
    if (!query.name.trim() || !query.email.trim() || !query.message.trim()) {
      toast('Please fill all fields first.', 'warn')
      return
    }
    try {
      setSavingQuery(true)
      await queriesAPI.create({
        name: query.name.trim(),
        email: query.email.trim(),
        message: query.message.trim(),
      })
      toast('Query submitted and saved successfully.', 'success')
      setQuery({ name:'', email:'', message:'' })
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Could not save query right now.'
      toast(msg, 'error')
    } finally {
      setSavingQuery(false)
    }
  }

  return (
    <div className="page-content" style={{position:'relative', overflow:'hidden'}}>
      <div style={{position:'fixed', inset:0, pointerEvents:'none', zIndex:0}}>
        <div style={{
          position:'absolute', top:`${-30 + orbShiftA}px`, left:'-140px', width:420, height:420, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(56,189,248,.28) 0%, rgba(56,189,248,0) 72%)',
          filter:'blur(10px)'
        }}/>
        <div style={{
          position:'absolute', top:`${140 + orbShiftB}px`, right:'-130px', width:460, height:460, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(45,212,191,.24) 0%, rgba(45,212,191,0) 72%)',
          filter:'blur(14px)'
        }}/>
        <div style={{
          position:'absolute', inset:0,
          backgroundImage:'linear-gradient(rgba(56,189,248,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,.05) 1px, transparent 1px)',
          backgroundSize:'36px 36px',
          opacity:.45
        }}/>
      </div>

      <div className="section-wrap" style={{position:'relative', zIndex:1, maxWidth:1180}}>
        <section style={{
          minHeight:'52vh',
          display:'block',
          marginTop:'1rem'
        }}>
          <div style={{
            background:'linear-gradient(140deg, rgba(45,212,191,.13), rgba(56,189,248,.07))',
            border:'1px solid rgba(56,189,248,.28)',
            borderRadius:24,
            padding:'2.1rem',
            backdropFilter:'blur(14px)',
            boxShadow:'0 18px 38px rgba(0,0,0,.28)'
          }}>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:'.5rem',
              border:'1px solid rgba(56,189,248,.35)', borderRadius:999, padding:'.35rem .9rem',
              fontSize:'.72rem', letterSpacing:'.08em', textTransform:'uppercase', color:'#7dd3fc', fontWeight:700,
              marginBottom:'1rem'
            }}>
              3D MEDICAL INTELLIGENCE
            </div>
            <h1 style={{
              fontFamily:"'Poppins',sans-serif",
              fontSize:'clamp(2rem, 4vw, 3.2rem)',
              lineHeight:1.08,
              marginBottom:'.9rem',
              letterSpacing:'.01em'
            }}>
              About <span style={{
                background:'linear-gradient(135deg, #2dd4bf, #38bdf8)',
                WebkitBackgroundClip:'text',
                WebkitTextFillColor:'transparent'
              }}>Visio3D</span>
            </h1>
            <p style={{color:'var(--muted)', fontSize:'.96rem', lineHeight:1.8, maxWidth:640}}>
              Visio3D converts medical image interpretation into a fast and understandable 3D experience.
              We combine AI diagnostics, visual storytelling, and clinical workflow support so teams can
              review scans more clearly and make better decisions.
            </p>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:'.8rem', marginTop:'1.5rem'}}>
              {[
                ['12k+', 'Scans Visualized'],
                ['98.4%', 'AI Accuracy'],
                ['340ms', 'Avg Inference']
              ].map(([n,l])=>(
                <div key={l} style={{
                  border:'1px solid rgba(45,212,191,.22)',
                  background:'rgba(45,212,191,.08)',
                  borderRadius:14,
                  padding:'.8rem .7rem',
                  textAlign:'center'
                }}>
                  <div style={{fontFamily:"'Poppins',sans-serif", fontWeight:800, fontSize:'1.22rem', color:'#67e8f9'}}>{n}</div>
                  <div style={{fontSize:'.72rem', color:'var(--muted)', marginTop:'.2rem'}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{marginTop:'1.2rem'}}>
          <div style={{
            border:'1px solid rgba(56,189,248,.24)',
            borderRadius:22,
            background:'linear-gradient(145deg, rgba(56,189,248,.12), rgba(45,212,191,.08))',
            padding:'1.6rem',
            boxShadow:'0 14px 30px rgba(0,0,0,.22)'
          }}>
            <h3 style={{fontFamily:"'Poppins',sans-serif", fontSize:'1.35rem', marginBottom:'.7rem'}}>Our Mission</h3>
            <p style={{fontSize:'.94rem', color:'var(--muted)', lineHeight:1.8, margin:0}}>
              Our mission is to make advanced medical imaging intelligence accessible, visual, and actionable.
              Visio3D helps clinicians and diagnostic teams move from static scan review to interactive 3D understanding,
              reducing ambiguity and accelerating confident decisions for patient care.
            </p>
          </div>
        </section>

        <section style={{marginTop:'1.6rem'}}>
          <h3 style={{fontFamily:"'Poppins',sans-serif", marginBottom:'1rem'}}>What Makes Visio3D Different</h3>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'1rem'}}>
            {[
              ['3D-First Diagnostics', 'Every report is connected to an interactive 3D context for clearer interpretation.'],
              ['AI + Clinical Flow', 'Model output is designed for practical review with confidence and severity insights.'],
              ['Trust & Privacy', 'Secure auth flow, protected storage, and architecture designed for healthcare data safety.']
            ].map(([title, text], idx)=>(
              <div key={title} style={{
                border:'1px solid rgba(45,212,191,.2)',
                borderRadius:16,
                background:'linear-gradient(160deg, rgba(45,212,191,.08), rgba(56,189,248,.05))',
                padding:'1.15rem',
                transform:`translateY(${Math.max(0, 24 - scrollY * 0.05 - idx * 3)}px)`,
                opacity: scrollY > 120 ? 1 : .82,
                transition:'transform .28s ease-out, opacity .3s ease-out',
                boxShadow:'0 10px 22px rgba(0,0,0,.16)'
              }}>
                <div style={{fontWeight:700, fontFamily:"'Poppins',sans-serif", marginBottom:'.45rem', color:'#7dd3fc'}}>{title}</div>
                <p style={{margin:0, fontSize:'.85rem', color:'var(--muted)', lineHeight:1.7}}>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{marginTop:'1.8rem', paddingBottom:'2.6rem'}}>
          <div style={{
            border:'1px solid rgba(45,212,191,.28)',
            borderRadius:20,
            background:'linear-gradient(150deg, rgba(45,212,191,.14), rgba(56,189,248,.1))',
            boxShadow:'0 16px 30px rgba(0,0,0,.22)',
            padding:'1.25rem',
            animation:'fadeIn .5s ease'
          }}>
            <h3 style={{fontFamily:"'Poppins',sans-serif", marginBottom:'.2rem'}}>Quick Query</h3>
            <p style={{margin:'0 0 1rem', color:'var(--muted)', fontSize:'.84rem'}}>Have a question about Visio3D? Send a short query and we will respond.</p>
            <form onSubmit={submitQuery} style={{display:'grid', gap:'.75rem'}}>
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'.65rem'}}>
                <input
                  value={query.name}
                  onChange={(e)=>updateQuery('name', e.target.value)}
                  placeholder="Your name"
                />
                <input
                  type="email"
                  value={query.email}
                  onChange={(e)=>updateQuery('email', e.target.value)}
                  placeholder="Email address"
                />
              </div>
              <textarea
                rows={3}
                value={query.message}
                onChange={(e)=>updateQuery('message', e.target.value)}
                placeholder="Write your query..."
              />
              <div style={{display:'flex', justifyContent:'flex-end'}}>
                <button className="btn btn-primary" type="submit" disabled={savingQuery} style={{padding:'.55rem 1.3rem'}}>{savingQuery ? 'Saving...' : 'Send Query'}</button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
