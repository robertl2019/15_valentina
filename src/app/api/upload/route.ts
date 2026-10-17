// ─────────────────────────────────────────────
// Recuerdos XV — api/upload/route.ts
// by Roberto Carlos Lizarazo Bayona
// POST /api/upload  →  R2 + Supabase insert
// Acepta FormData (fotos) o JSON (videos ya subidos a R2 vía presign)
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { uploadToR2 }                from '@/lib/r2'
import { supabase }                  from '@/lib/supabase'

const MAX_SIZE = 100 * 1024 * 1024

const MIME_EXT: Record<string, string> = {
  'image/jpeg':      'jpg',
  'image/png':       'png',
  'image/webp':      'webp',
  'image/gif':       'gif',
  'image/heic':      'heic',
  'video/mp4':       'mp4',
  'video/quicktime': 'mov',
  'video/webm':      'webm',
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') ?? ''

    // ── Video ya subido a R2 via presign ──
    if (contentType.includes('application/json')) {
      const { fileUrl, caption, categoria, tipo } = await req.json()

      if (!fileUrl) {
        return NextResponse.json({ message: 'Falta fileUrl' }, { status: 400 })
      }

      const { error } = await supabase.from('uploads').insert({
        url:        fileUrl,
        tipo:       tipo ?? 'video',
        caption:    (caption ?? '').trim() || null,
        categoria:  categoria ?? 'Amigos',
        reacciones: 0,
      })

      if (error) {
        console.error('[upload/json] Supabase error:', error)
        return NextResponse.json({ message: 'Error al guardar en base de datos' }, { status: 500 })
      }

      return NextResponse.json({ ok: true, url: fileUrl })
    }

    // ── Foto via FormData ──
    const form      = await req.formData()
    const raw       = form.get('file')
    const caption   = (form.get('caption')   as string | null) ?? ''
    const categoria = (form.get('categoria') as string | null) ?? 'Amigos'

    if (!(raw instanceof File)) {
      return NextResponse.json({ message: 'No se recibió archivo' }, { status: 400 })
    }

    const mimeType = raw.type
    const ext      = MIME_EXT[mimeType]
    if (!ext) {
      return NextResponse.json({ message: 'Formato no permitido' }, { status: 400 })
    }

    const buffer = Buffer.from(await raw.arrayBuffer())
    if (buffer.byteLength > MAX_SIZE) {
      return NextResponse.json({ message: 'El archivo supera los 100 MB' }, { status: 413 })
    }

    const url  = await uploadToR2(buffer, mimeType, ext)
    const tipo = mimeType.startsWith('video') ? 'video' : 'foto'

    const { error } = await supabase.from('uploads').insert({
      url,
      tipo,
      caption:    caption.trim() || null,
      categoria:  categoria || null,
      reacciones: 0,
    })

    if (error) {
      console.error('[upload] Supabase error:', error)
      return NextResponse.json({ message: 'Error al guardar en base de datos' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, url })
  } catch (err) {
    console.error('[upload] Unexpected error:', err)
    return NextResponse.json({ message: 'Error inesperado' }, { status: 500 })
  }
}