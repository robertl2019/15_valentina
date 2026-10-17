// ─────────────────────────────────────────────
// Recuerdos XV — page.tsx (Home)
// by Roberto Carlos Lizarazo Bayona
// Página principal: hero + carrusel + preview últimas fotos
// ─────────────────────────────────────────────

import Link       from 'next/link'
import { supabase } from '@/lib/supabase'
import Carousel   from '@/components/Carousel'
import PhotoCard  from '@/components/PhotoCard'
import BottomNav  from '@/components/BottomNav'
import type { Upload } from '@/lib/supabase'
import PreviewGrid from '@/components/PreviewGrid'
import AutoRefresh from '@/components/AutoRefresh'

// Revalidar cada 60s (ISR)
export const revalidate = 5

async function getData() {
  // Top 5 para el carrusel
  const { data: topItems } = await supabase
    .from('uploads')
    .select('*')
    .order('reacciones', { ascending: false })
    .limit(5)

  // Últimas 4 para el preview
  const { data: latest } = await supabase
    .from('uploads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4)

  return {
    topItems: (topItems ?? []) as Upload[],
    latest:   (latest  ?? []) as Upload[],
  }
}

export default async function HomePage() {
  const { topItems, latest } = await getData()

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <div
          className="hero-photo"
          style={{ backgroundImage: 'url(/hero.jpg)' }}
        />
        <div className="hero-vignette" />

        <div className="hero-topbar">
         <div className="glass-pill" style={{ color: '#c8a06a', borderColor: 'rgba(200,160,100,0.5)' }}>15 años</div>
         <div className="glass-pill" style={{ color: '#c8a06a', borderColor: 'rgba(200,160,100,0.5)' }}>17 · Oct · 2026</div>
        </div>

       <div className="hero-bottom" style={{ textAlign: 'center' }}>
          <p className="hero-eyebrow" style={{ color: '#c8a06a' }}>Una noche para recordar siempre</p>
          <h1 className="hero-name">Valentina</h1>
          <p className="hero-sub">Forero</p>
          <Link href="/subir" className="btn-glass-cta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            Compartir foto
          </Link>
        </div>

        <div className="scroll-hint">↓</div>
      </section>

      {/* ── Carrusel: las más queridas ── */}
      <div className="page-content">
        <div className="section-head">
          <h2 className="section-title">Las más queridas</h2>
          <span className="section-count">{topItems.length} fotos</span>
        </div>

        {topItems.length > 0
          ? <Carousel items={topItems} />
          : <p style={{ color: 'var(--fg-soft)', padding: '20px 0' }}>Sé el primero en subir una foto </p>
        }

        {/* ── Preview últimas fotos ── */}
        <div className="section-head" style={{ marginTop: 8 }}>
          <h2 className="section-title">Últimas fotos</h2>
          <Link href="/galeria" className="section-link">Ver todas →</Link>
        </div>
      </div>
      

      {/* ── ver en forma de estado ── */} 
      <PreviewGrid items={latest}/>

      {/* ── Crédito ── */}
      <p className="app-credit">
        Recuerdos XV · by Roberto Carlos Lizarazo Bayona
      </p>

      <BottomNav />
      <AutoRefresh interval={5000} />
    </>
  )
}
