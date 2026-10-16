// ─────────────────────────────────────────────
// Recuerdos XV — api/reaccionar/route.ts
// by Roberto Carlos Lizarazo Bayona
// POST /api/reaccionar  →  incrementa reacciones en Supabase
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json() as { id?: string }

    if (!id) {
      return NextResponse.json({ message: 'ID requerido' }, { status: 400 })
    }

    // Supabase RPC: incrementa reacciones atómicamente
    // Requiere esta función en Supabase:
    //
    //   create or replace function increment_reacciones(row_id uuid)
    //   returns void language sql security definer as $$
    //     update uploads set reacciones = reacciones + 1 where id = row_id;
    //   $$;
    //
    const { error } = await supabase.rpc('increment_reacciones', { row_id: id })

    if (error) {
      // Fallback: read → write (menos seguro pero funciona sin la RPC)
      const { data } = await supabase
        .from('uploads')
        .select('reacciones')
        .eq('id', id)
        .single()

      if (!data) return NextResponse.json({ message: 'No encontrado' }, { status: 404 })

      await supabase
        .from('uploads')
        .update({ reacciones: (data.reacciones ?? 0) + 1 })
        .eq('id', id)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[reaccionar]', err)
    return NextResponse.json({ message: 'Error inesperado' }, { status: 500 })
  }
}
