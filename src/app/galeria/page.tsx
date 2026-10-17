// ─────────────────────────────────────────────
// Recuerdos XV — galeria/page.tsx
// by Roberto Carlos Lizarazo Bayona
// Galería completa con filtros por categoría
// ─────────────────────────────────────────────

import Link        from 'next/link'
import { supabase }  from '@/lib/supabase'
import GalleryGrid from '@/components/GalleryGrid'
import BottomNav   from '@/components/BottomNav'
import type { Upload } from '@/lib/supabase'

export const revalidate = 5

async function getData() {
  const { data } = await supabase
    .from('uploads')
    .select('*')
    .order('created_at', { ascending: false })

  return (data ?? []) as Upload[]
}

export default async function GaleriaPage() {
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
        <span className="upload-title">Galería</span>
      </div>

      <div className="page-content">
        <GalleryGrid items={items} />
      </div>

      <BottomNav />
    </>
  )
}
