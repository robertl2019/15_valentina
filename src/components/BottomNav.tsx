// ─────────────────────────────────────────────
// Recuerdos XV — BottomNav.tsx
// by Roberto Carlos Lizarazo Bayona
// ─────────────────────────────────────────────

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
)

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
)

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

export default function BottomNav() {
  const path = usePathname()

  const isGallery = path === '/galeria'
  const isTop     = path === '/top'
  // home ('/') → ninguno activo

  return (
    <nav className="bottom-nav">
      <Link
        href="/galeria"
        className={`nav-btn${isGallery ? ' active' : ''}`}
      >
        <GridIcon />
        <span>Galería</span>
      </Link>

      <Link href="/subir" className="nav-btn upload-btn">
        <CameraIcon />
        <span>Subir foto</span>
      </Link>

      <Link
        href="/top"
        className={`nav-btn${isTop ? ' active' : ''}`}
      >
        <StarIcon />
        <span>Top fotos</span>
      </Link>
    </nav>
  )
}
