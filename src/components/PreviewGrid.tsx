'use client'
import { useState } from 'react'
import PhotoCard from './PhotoCard'
import StoryViewer from './StoryViewer'
import type { Upload } from '@/lib/supabase'

export default function PreviewGrid({ items }: { items: Upload[] }) {
  const [selected, setSelected] = useState<number | null>(null)
  return (
    <>
      <div className="gallery" style={{ paddingBottom: 160, paddingLeft: 16, paddingRight: 16 }}>
        {items.map((item, i) => (
          <PhotoCard key={item.id} item={item} onClick={() => setSelected(i)} />
        ))}
      </div>
      {selected !== null && (
        <StoryViewer items={items} startAt={selected} onClose={() => setTimeout(() => setSelected(null), 0)} />
      )}
    </>
  )
}