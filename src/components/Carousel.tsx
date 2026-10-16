// ─────────────────────────────────────────────
// Recuerdos XV — Carousel.tsx
// by Roberto Carlos Lizarazo Bayona
// Auto-play carousel with manual nav + swipe
// ─────────────────────────────────────────────

'use client'

import { useEffect, useRef, useState } from 'react'
import StoryViewer from './StoryViewer'
import type { Upload } from '@/lib/supabase'

const ArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
)
const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
)
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 12, height: 12 }}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)

interface Props {
  items: Upload[]   // top 5 by reactions
}

export default function Carousel({ items }: Props) {
  const [cur, setCur]           = useState(0)
  const [storyIdx, setStoryIdx] = useState<number | null>(null)
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const total   = items.length

  const goTo = (i: number) => setCur((i + total) % total)

  const resetAuto = () => {
    if (autoRef.current) clearInterval(autoRef.current)
    autoRef.current = setInterval(() => setCur(c => (c + 1) % total), 3500)
  }

  useEffect(() => {
    resetAuto()
    return () => { if (autoRef.current) clearInterval(autoRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total])

  // Swipe
  const touchX = useRef<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX }
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchX.current === null) return
    const dx = touchX.current - e.changedTouches[0].clientX
    if (Math.abs(dx) > 40) { resetAuto(); goTo(cur + (dx > 0 ? 1 : -1)) }
    touchX.current = null
  }

  if (items.length === 0) return null

  return (
    <>
      <div className="carousel-wrap">
        <div
          className="carousel-track"
          style={{ transform: `translateX(-${cur * 100}%)` }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {items.map((item, i) => (
            <div
              key={item.id}
              className="carousel-slide"
              onClick={() => setStoryIdx(i)}
            >
              <div
                className="slide-bg"
                style={{ backgroundImage: `url(${item.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              />
              <div className="slide-glass-info">
                <span className="slide-cap">{item.caption ?? ''}</span>
                <span className="slide-hearts">
                  <HeartIcon />
                  {item.reacciones}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button className="carousel-arrow prev" onClick={() => { resetAuto(); goTo(cur - 1) }}>
          <ArrowLeft />
        </button>
        <button className="carousel-arrow next" onClick={() => { resetAuto(); goTo(cur + 1) }}>
          <ArrowRight />
        </button>

        <div className="carousel-dots">
          {items.map((_, i) => (
            <button
              key={i}
              className={`dot${cur === i ? ' active' : ''}`}
              onClick={() => { resetAuto(); goTo(i) }}
            />
          ))}
        </div>
      </div>

      {storyIdx !== null && (
        <StoryViewer
          items={items}
          startAt={storyIdx}
          onClose={() => setTimeout(() => setStoryIdx(null), 0)}
        />
      )}
    </>
  )
}
