// ─────────────────────────────────────────────
// Recuerdos XV — supabase.ts
// by Roberto Carlos Lizarazo Bayona
// ─────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(url, anon)

// ── Types ──────────────────────────────────────

export type Categoria =
  | 'Familia'
  | 'Amigos'
  | 'Decoración'
  | 'Hora Loca'
  | 'Protocolo'
  | 'Quinceañera'

export interface Upload {
  id:          string
  url:         string
  tipo:        'foto' | 'video'
  created_at:  string
  caption:     string | null
  categoria:   Categoria | null
  reacciones:  number
}
