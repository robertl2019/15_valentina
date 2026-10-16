'use client'

import { useState } from 'react'
import type { Upload } from '@/lib/supabase'

interface Props {
  item:    Upload
  onClick: () => void
}

export default function PhotoCard({ item, onClick }: Props) {
  const [localLikes, setLocalLikes] = useState(item.reacciones)
  const [liked, setLiked]           = useState(false)

  const handleLike = async (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    if (liked) return
    setLiked(true)
    setLocalLikes(n => n + 1)
    await fetch('/api/reaccionar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id }),
    })
  }

  return (
    <button
      className="photo-card"
      style={{ display: 'block', width: '100%', textAlign: 'left', padding: 0, font: 'inherit' }}
      onClick={onClick}
    >
      {item.tipo === 'video' ? (
        <video
          src={item.url}
          className="photo-img"
          style={{ height: 180, objectFit: 'cover', pointerEvents: 'none' }}
          muted
          playsInline
        />
      ) : (
        <img
          src={item.url}
          alt={item.caption ?? ''}
          className="photo-img"
          style={{
            height: 155 + ((item.reacciones % 4) * 20),
            objectFit: 'cover',
            display: 'block',
            width: '100%',
            pointerEvents: 'none',
          }}
          draggable={false}
        />
      )}

      {item.caption && (
        <div className="card-glass-footer" style={{ pointerEvents: 'none' }}>
          <p className="card-caption">{item.caption}</p>
        </div>
      )}

      <div
        className={`heart-btn${liked ? ' liked' : ''}`}
        onClick={handleLike}
        onTouchEnd={handleLike}
      >
        <svg viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span>{localLikes}</span>
      </div>
    </button>
  )
}
