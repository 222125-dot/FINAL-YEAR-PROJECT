import React, { useEffect, useRef } from 'react'
import { apiBase } from '../utils/api'

/**
 * ModelViewer — wraps Google's <model-viewer> web component
 * for real GLB/GLTF 3D rendering with AR, auto-rotate, etc.
 */
export default function ModelViewer({ src, alt = '3D Model', style = {}, showControls = true }) {
  const ref = useRef()
  const backendOrigin = apiBase.replace(/\/api$/, '')
  const resolvedSrc = src?.startsWith('/static/') ? `${backendOrigin}${src}` : src

  useEffect(() => {
    // model-viewer is a web component — loaded via CDN in index.html
    if (ref.current && resolvedSrc) {
      // Force reload when src changes
      ref.current.src = resolvedSrc
    }
  }, [resolvedSrc])

  if (!src) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100%', color: 'var(--muted)',
        ...style,
      }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem', opacity: .3 }}>🫁</div>
        <p style={{ fontSize: '.88rem' }}>Upload a scan to view<br />the 3D kidney model</p>
      </div>
    )
  }

  return (
    <model-viewer
      ref={ref}
      src={resolvedSrc}
      alt={alt}
      auto-rotate
      camera-controls
      shadow-intensity="1"
      environment-image="neutral"
      exposure="0.8"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '360px',
        background: 'transparent',
        '--poster-color': 'transparent',
        ...style,
      }}
    >
      {showControls && (
        <div slot="hotspot-kidney" data-position="0 0 0" data-normal="0 1 0">
          <div style={{
            background: 'rgba(0,255,136,.15)',
            border: '1px solid var(--g1)',
            borderRadius: 6, padding: '.3rem .6rem',
            fontSize: '.7rem', color: 'var(--g1)', whiteSpace: 'nowrap',
          }}>
            Disease Region
          </div>
        </div>
      )}
    </model-viewer>
  )
}
