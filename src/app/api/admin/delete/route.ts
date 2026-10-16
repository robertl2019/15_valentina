// src/app/api/admin/delete/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const ADMIN_KEY = process.env.ADMIN_KEY ?? 'danna2026'

export async function POST(req: NextRequest) {
  const { id, key } = await req.json()
  if (key !== ADMIN_KEY) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { error } = await supabase.from('uploads').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
