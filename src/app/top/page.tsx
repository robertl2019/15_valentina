// ─────────────────────────────────────────────
// Recuerdos XV — top/page.tsx
// by Roberto Carlos Lizarazo Bayona
// Top fotos ordenadas por reacciones (likes)
// ─────────────────────────────────────────────

import Link        from 'next/link'
import { supabase }  from '@/lib/supabase'
import GalleryGrid from '@/components/GalleryGrid'
import BottomNav   from '@/components/BottomNav'
import type { Upload } from '@/lib/supabase'

export const revalidate = 30

async function getData() {
  const { data } = await supabase
    .from('uploads')
    .select('*')
    .order('reacciones', { ascending: false })

  return (data ?? []) as Upload[]
}

export default async function TopPage() {
  const items = await getData()

  return (
    <>
      {/* Header pegajoso con flecha atrás */}
      <div className="upload-header">
        <Link href="/" className="back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <span className="upload-title">Top fotos</span>
        <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--fg-soft)' }}>por likes</span>
      </div>

      <div className="page-content">
        <GalleryGrid items={items} />
      </div>

      <BottomNav />
    </>
  )
}
