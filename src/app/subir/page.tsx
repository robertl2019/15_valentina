// src/app/subir/page.tsx
'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Categoria } from '@/lib/supabase'

const CATEGORIAS: Categoria[] = ['Quinceañera', 'Familia', 'Amigos', 'Decoración', 'Hora Loca', 'Protocolo']

const UploadIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
)

type Status = 'idle' | 'checking' | 'uploading' | 'success' | 'error'

async function isBlurry(file: File): Promise<boolean> {
  return new Promise(resolve => {
    if (!file.type.startsWith('image/')) { resolve(false); return }
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 200; canvas.height = 200
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, 200, 200)
      URL.revokeObjectURL(url)
      const { data } = ctx.getImageData(0, 0, 200, 200)
      const gray: number[] = []
      for (let i = 0; i < data.length; i += 4)
        gray.push(0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2])
      const w = 200
      let lap = 0, count = 0
      for (let y = 1; y < 199; y++) for (let x = 1; x < 199; x++) {
        const i = y * w + x
        const v = -gray[i-w-1] - gray[i-w] - gray[i-w+1]
                  - gray[i-1] + 8*gray[i] - gray[i+1]
                  - gray[i+w-1] - gray[i+w] - gray[i+w+1]
        lap += v * v; count++
      }
      resolve((lap / count) < 80)
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(false) }
    img.src = url
  })
}

export default function SubirPage() {
  const router = useRouter()

  const [file, setFile]           = useState<File | null>(null)
  const [preview, setPreview]     = useState<string | null>(null)
  const [caption, setCaption]     = useState('')
  const [cat, setCat]             = useState<Categoria>('Quinceañera')
  const [status, setStatus]       = useState<Status>('idle')
  const [error, setError]         = useState('')
  const [blurWarn, setBlurWarn]   = useState(false)
  const inputRef                  = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    setFile(f); setPreview(URL.createObjectURL(f)); setBlurWarn(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const doUpload = async (f: File) => {
  setStatus('uploading'); setError('')
  try {
    if (f.type.startsWith('video/')) {
      const ext = f.name.split('.').pop() ?? 'mp4'

      // 1. Pedir URL firmada
      const { url: presignUrl, key } = await fetch('/api/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ext, mimeType: f.type }),
      }).then(r => r.json())

      // 2. Subir directo a R2
      await fetch(presignUrl, {
        method: 'PUT',
        body: f,
        headers: { 'Content-Type': f.type },
      })

      // 3. Registrar en Supabase
      const fileUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl, caption, categoria: cat, tipo: 'video' }),
      })
      if (!res.ok) {
        const { message } = await res.json()
        setError(message ?? 'Error al subir.'); setStatus('error'); return
      }
    } else {
      // Fotos: flujo original
      const form = new FormData()
      form.append('file', f)
      form.append('caption', caption)
      form.append('categoria', cat)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      if (!res.ok) {
        const { message } = await res.json()
        setError(message ?? 'Error al subir.'); setStatus('error'); return
      }
    }

    setStatus('success')
    setTimeout(() => router.push('/'), 1800)
  } catch {
    setError('Error de conexión. Intenta de nuevo.')
    setStatus('error')
  }
}

  const handleSubmit = async () => {
    if (!file) return
    setBlurWarn(false)
    if (file.type.startsWith('image/')) {
      setStatus('checking')
      const blurry = await isBlurry(file)
      if (blurry) { setBlurWarn(true); setStatus('idle'); return }
    }
    await doUpload(file)
  }

  return (
    <>
      <div className="upload-page">
        <div className="upload-header">
          <Link href="/" className="back-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <span className="upload-title">Comparte tu recuerdo</span>
        </div>

        <div
          className="upload-zone"
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          style={preview ? { padding: 0, overflow: 'hidden', border: '1.5px solid var(--glass-border)' } : {}}
        >
          {preview ? (
            file?.type.startsWith('video') ? (
              <video src={preview} controls style={{ width: '100%', borderRadius: 18, display: 'block' }} />
            ) : (
              <img src={preview} alt="Preview" style={{ width: '100%', borderRadius: 18, display: 'block' }} />
            )
          ) : (
            <>
              <div className="uz-icon"><UploadIcon /></div>
              <p className="uz-label">Elige una foto o video</p>
              <p className="uz-sub">Desde tu galería</p>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />

        {blurWarn && (
          <div style={{ background: 'rgba(200,80,80,0.12)', border: '1px solid rgba(200,80,80,0.3)', borderRadius: 12, padding: '12px 16px', marginTop: 12 }}>
            <p style={{ color: 'var(--rosa-deep)', fontSize: 13, margin: 0, marginBottom: 8 }}>
              ⚠️ La foto parece estar borrosa o desenfocada.
            </p>
            <button
              onClick={() => { setBlurWarn(false); if (file) doUpload(file) }}
              style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, border: '1px solid var(--rosa-deep)', background: 'transparent', color: 'var(--rosa-deep)', cursor: 'pointer' }}
            >
              Subir de todas formas
            </button>
          </div>
        )}

        <div className="field-group">
          <label className="field-label">
            Mensaje para Valentina <span style={{ opacity: 0.5, fontWeight: 300 }}>(opcional)</span>
          </label>
          <div style={{ position: 'relative' }}>
            <textarea
              className="field-textarea"
              placeholder="Escribe algo especial..."
              maxLength={150}
              value={caption}
              onChange={e => setCaption(e.target.value)}
            />
            <span style={{ position: 'absolute', bottom: 8, right: 12, fontSize: 10, color: 'var(--fg-soft)', opacity: 0.5 }}>
              {caption.length}/150
            </span>
          </div>
        </div>

        <div className="field-group">
          <label className="field-label">Momento</label>
          <div className="cat-grid">
            {CATEGORIAS.map(c => (
              <button
                key={c}
                className={`cat-btn${(c === 'Protocolo' || c === 'Quinceañera') ? ' full' : ''}${cat === c ? ' active' : ''}`}
                onClick={() => setCat(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p style={{ color: 'var(--rosa-deep)', fontSize: 13, marginTop: 12 }}>{error}</p>
        )}

        {status === 'success' ? (
          <div style={{ textAlign: 'center', paddingTop: 24, color: 'var(--rosa-deep)', fontSize: 15, fontWeight: 600 }}>
            ¡Recuerdo subido! 🎉 Redirigiendo…
          </div>
        ) : (
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={!file || status === 'uploading' || status === 'checking'}
            style={{ opacity: (!file || status === 'uploading' || status === 'checking') ? 0.6 : 1 }}
          >
            {status === 'uploading' ? 'Subiendo…' : status === 'checking' ? 'Verificando…' : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }}>
                  <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                </svg>
                Subir recuerdo
              </>
            )}
          </button>
        )}
      </div>
    </>
  )
}
