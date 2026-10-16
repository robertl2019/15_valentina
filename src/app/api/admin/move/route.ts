// src/app/api/admin/move/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const ADMIN_KEY = process.env.ADMIN_KEY ?? 'danna2026'

export async function POST(req: NextRequest) {
  const { id, categoria, key } = await req.json()
  if (key !== ADMIN_KEY) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!id || !categoria) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

  const { error } = await supabase.from('uploads').update({ categoria }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
