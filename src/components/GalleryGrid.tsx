'use client'

import { useState } from 'react'
import PhotoCard     from './PhotoCard'
import StoryViewer   from './StoryViewer'
import type { Upload, Categoria } from '@/lib/supabase'

const CATEGORIAS: Array<Categoria | 'Todas'> = [
  'Todas', 'Quinceañera', 'Familia', 'Amigos', 'Decoración', 'Hora Loca', 'Protocolo',
]

export default function GalleryGrid({ items }: { items: Upload[] }) {
  const [cat, setCat]           = useState<Categoria | 'Todas'>('Todas')
  const [storyIdx, setStoryIdx] = useState<number | null>(null)

  const filtered = cat === 'Todas'
    ? items
    : items.filter(i => i.categoria === cat)

  return (
    <>
      <div className="tabs-wrap">
        <div className="tabs">
          {CATEGORIAS.map(c => (
            <button
              key={c}
              className={`tab${cat === c ? ' active' : ''}`}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="gallery">
        {filtered.map((item, i) => (
          <PhotoCard
            key={item.id}
            item={item}
            onClick={() => setStoryIdx(i)}
          />
        ))}
        {filtered.length === 0 && (
          <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--fg-soft)', padding: '40px 0' }}>
            Aún no hay fotos en esta categoría
          </p>
        )}
      </div>

      {storyIdx !== null && (
        <StoryViewer
          items={filtered}
          startAt={storyIdx}
          onClose={() => setTimeout(() => setStoryIdx(null), 0)}
        />
      )}
    </>
  )
}
