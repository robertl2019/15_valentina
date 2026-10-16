// ─────────────────────────────────────────────
// Recuerdos XV — StoryViewer.tsx
// by Roberto Carlos Lizarazo Bayona
// ─────────────────────────────────────────────

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { Upload } from '@/lib/supabase'

const STORY_DUR = 4000

interface Props {
  items:   Upload[]
  startAt: number
  onClose: () => void
}

function StoryViewerInner({ items, startAt, onClose }: Props) {
  const [idx, setIdx]       = useState(startAt)
  const [paused, setPaused] = useState(false)
  const [liked, setLiked]   = useState<Set<string>>(new Set())
  const [likes, setLikes]   = useState<Record<string, number>>({})

  // Zoom
  const [scale, setScale]   = useState(1)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const lastDist             = useRef<number | null>(null)
  const isPinching           = useRef(false)

  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startRef    = useRef<number>(Date.now())
  const pausedAtRef = useRef<number | null>(null)

  const current = items[idx]

  useEffect(() => {
    setLikes(prev => ({ ...prev, [current.id]: current.reacciones }))
  }, [current])

  // Reset zoom al cambiar foto
  useEffect(() => {
    setScale(1)
    setOrigin({ x: 50, y: 50 })
    lastDist.current = null
    isPinching.current = false
  }, [idx])

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const advance = useCallback((dir: 1 | -1) => {
    clearTimer()
    setIdx(i => {
      const next = i + dir
      if (next < 0 || next >= items.length) {
        setTimeout(() => onClose(), 0)
        return i
      }
      return next
    })
  }, [clearTimer, items.length, onClose])

  useEffect(() => {
    clearTimer()
    setPaused(false)
    pausedAtRef.current = null
    startRef.current = Date.now()

    const fill = document.getElementById(`seg-fill-${idx}`) as HTMLDivElement | null
    if (fill) {
      fill.style.transition = 'none'
      fill.style.width = '0%'
      requestAnimationFrame(() => {
        fill.style.transition = `width ${STORY_DUR}ms linear`
        fill.style.width = '100%'
      })
    }

    timerRef.current = setTimeout(() => advance(1), STORY_DUR)
    return () => clearTimer()
  }, [idx, advance, clearTimer])

  const pauseStory = useCallback(() => {
    if (paused) return
    setPaused(true)
    clearTimer()
    pausedAtRef.current = Date.now()
    const fill = document.getElementById(`seg-fill-${idx}`) as HTMLDivElement | null
    if (fill) {
      const elapsed = Date.now() - startRef.current
      const pct = Math.min((elapsed / STORY_DUR) * 100, 100)
      fill.style.transition = 'none'
      fill.style.width = `${pct}%`
    }
  }, [paused, clearTimer, idx])

  const resumeStory = useCallback(() => {
    if (!paused) return
    setPaused(false)
    if (pausedAtRef.current !== null) {
      startRef.current += Date.now() - pausedAtRef.current
      pausedAtRef.current = null
    }
    const elapsed   = Date.now() - startRef.current
    const remaining = Math.max(300, STORY_DUR - elapsed)
    const fill = document.getElementById(`seg-fill-${idx}`) as HTMLDivElement | null
    if (fill) {
      fill.style.transition = `width ${remaining}ms linear`
      fill.style.width = '100%'
    }
    timerRef.current = setTimeout(() => advance(1), remaining)
  }, [paused, idx, advance])

  const handleLike = async () => {
    if (liked.has(current.id)) return
    setLiked(prev => new Set([...prev, current.id]))
    setLikes(prev => ({ ...prev, [current.id]: (prev[current.id] ?? 0) + 1 }))
    await fetch('/api/reaccionar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: current.id }),
    })
  }

  // ── Pinch-to-zoom ─────────────────────────
  const getDistance = (touches: React.TouchList) =>
    Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    )

  const onMediaTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.stopPropagation()
      isPinching.current = true
      lastDist.current = getDistance(e.touches)
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      setOrigin({
        x: ((cx - rect.left) / rect.width) * 100,
        y: ((cy - rect.top) / rect.height) * 100,
      })
      pauseStory()
    }
  }

  const onMediaTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastDist.current !== null) {
      e.stopPropagation()
      const newDist = getDistance(e.touches)
      const ratio   = newDist / lastDist.current
      setScale(s => Math.min(Math.max(s * ratio, 1), 4))
      lastDist.current = newDist
    }
  }

  const onMediaTouchEnd = () => {
    lastDist.current = null
    if (scale <= 1.05) setScale(1)
    setTimeout(() => { isPinching.current = false }, 100)
    resumeStory()
  }

  // ── Overlay touch (swipe + pausa) ─────────
  const touchStartX = useRef<number | null>(null)

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 1) return
    const el = e.target as HTMLElement
    if (el.closest('.story-close, .story-glass-btn, .story-tap-prev, .story-tap-next')) return
    touchStartX.current = e.touches[0].clientX
    pauseStory()
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (isPinching.current) return
    const el = e.target as HTMLElement
    if (el.closest('.story-close, .story-glass-btn')) return
    if (touchStartX.current !== null) {
      const dx = touchStartX.current - e.changedTouches[0].clientX
      if (Math.abs(dx) > 50) {
        advance(dx > 0 ? 1 : -1)
        touchStartX.current = null
        return
      }
    }
    touchStartX.current = null
    resumeStory()
  }

  return (
    <div
      className="story-overlay"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onContextMenu={e => e.preventDefault()}
    >
      {/* Progress bar */}
      <div className="story-bar">
        {items.map((_, j) => (
          <div key={j} className={`s-seg${j < idx ? ' done' : ''}`}>
            <div className="s-seg-fill" id={`seg-fill-${j}`} />
          </div>
        ))}
      </div>

      {/* Close */}
      <button className="story-close" onClick={onClose}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Media */}
      <div className="story-media-wrap">
        {current.tipo === 'video' ? (
          <video
            key={current.id}
            src={current.url}
            autoPlay
            muted
            playsInline
            onContextMenu={e => e.preventDefault()}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <img
            key={current.id}
            src={current.url}
            alt={current.caption ?? ''}
            draggable={false}
            onContextMenu={e => e.preventDefault()}
            onTouchStart={onMediaTouchStart}
            onTouchMove={onMediaTouchMove}
            onTouchEnd={onMediaTouchEnd}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transform: `scale(${scale})`,
              transformOrigin: `${origin.x}% ${origin.y}%`,
              transition: scale === 1 ? 'transform 0.2s' : 'none',
              userSelect: 'none',
            }}
          />
        )}
      </div>

      {/* Tap zones */}
      <button className="story-tap-prev" onClick={() => advance(-1)} />
      <button className="story-tap-next" onClick={() => advance(1)} />

      {/* Footer */}
      <div className="story-footer" style={{ alignItems: 'center' }}>
        <p className="story-cap" style={{ textAlign: 'center', width: '100%' }}>
          {current.caption ?? ''}
        </p>
        <button
          className={`story-glass-btn${liked.has(current.id) ? ' reacted' : ''}`}
          onClick={handleLike}
        >
          <svg viewBox="0 0 24 24" fill={liked.has(current.id) ? '#fff' : 'none'} stroke="currentColor" strokeWidth={2}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span>{likes[current.id] ?? current.reacciones} Me encanta</span>
        </button>
      </div>
    </div>
  )
}

export default function StoryViewer(props: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null
  return createPortal(<StoryViewerInner {...props} />, document.body)
}
