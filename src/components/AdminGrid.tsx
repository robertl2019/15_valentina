// src/components/AdminGrid.tsx
'use client'

import { useState } from 'react'
import type { Upload, Categoria } from '@/lib/supabase'

const CATEGORIAS: Categoria[] = ['Quinceañera', 'Familia', 'Amigos', 'Decoración', 'Hora Loca', 'Protocolo']

interface Props { items: Upload[]; adminKey: string }

export default function AdminGrid({ items: initial, adminKey }: Props) {
  const [items, setItems] = useState(initial)
  const [busy, setBusy]   = useState<string | null>(null)

  const deleteItem = async (id: string) => {
    if (!confirm('¿Eliminar esta foto/video?')) return
    setBusy(id)
    const res = await fetch('/api/admin/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, key: adminKey }),
    })
    if (res.ok) setItems(prev => prev.filter(i => i.id !== id))
    else alert('Error al eliminar')
    setBusy(null)
  }

  const moveItem = async (id: string, categoria: Categoria) => {
    setBusy(id)
    const res = await fetch('/api/admin/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, categoria, key: adminKey }),
    })
    if (res.ok) setItems(prev => prev.map(i => i.id === id ? { ...i, categoria } : i))
    else alert('Error al mover')
    setBusy(null)
  }

  return (
    <div style={{ padding: '20px 16px', maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>🛠 Admin</h1>
      <p style={{ fontSize: 13, opacity: 0.5, marginBottom: 24 }}>{items.length} fotos/videos</p>

      {items.map(item => (
        <div key={item.id} style={{ marginBottom: 32, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
          {item.tipo === 'video' ? (
            <video src={item.url} controls style={{ width: '100%', display: 'block', maxHeight: 300, objectFit: 'cover' }} />
          ) : (
            <img src={item.url} alt="" style={{ width: '100%', display: 'block', maxHeight: 300, objectFit: 'cover' }} />
          )}

          <div style={{ padding: '12px 14px' }}>
            {item.caption && <p style={{ fontSize: 13, marginBottom: 10, opacity: 0.8 }}>"{item.caption}"</p>}

            <p style={{ fontSize: 11, opacity: 0.4, marginBottom: 8 }}>Categoría actual: <strong>{item.categoria}</strong></p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {CATEGORIAS.map(c => (
                <button
                  key={c}
                  disabled={busy === item.id}
                  onClick={() => moveItem(item.id, c)}
                  style={{
                    fontSize: 11, padding: '4px 10px', borderRadius: 20,
                    border: '1px solid',
                    borderColor: item.categoria === c ? 'var(--rosa-deep)' : 'rgba(255,255,255,0.15)',
                    background: item.categoria === c ? 'var(--rosa-deep)' : 'transparent',
                    color: item.categoria === c ? '#fff' : 'inherit',
                    cursor: busy === item.id ? 'not-allowed' : 'pointer',
                    opacity: busy === item.id ? 0.5 : 1,
                  }}
                >
                  {c}
                </button>
              ))}
            </div>

            <button
              disabled={busy === item.id}
              onClick={() => deleteItem(item.id)}
              style={{
                fontSize: 12, padding: '6px 14px', borderRadius: 8,
                border: '1px solid rgba(200,60,60,0.4)',
                background: 'rgba(200,60,60,0.1)',
                color: '#e05555', cursor: 'pointer',
                opacity: busy === item.id ? 0.5 : 1,
              }}
            >
              🗑 Eliminar
            </button>
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <p style={{ textAlign: 'center', opacity: 0.4, marginTop: 60 }}>No hay fotos aún</p>
      )}
    </div>
  )
}
