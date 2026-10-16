// src/app/admin/page.tsx
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AdminGrid    from '@/components/AdminGrid'

const ADMIN_KEY = process.env.ADMIN_KEY ?? 'danna2026'

interface Props {
  searchParams: Promise<{ key?: string }>
}

export default async function AdminPage({ searchParams }: Props) {
  const { key } = await searchParams
  if (key !== ADMIN_KEY) redirect('/')

  const { data } = await supabase
    .from('uploads')
    .select('*')
    .order('created_at', { ascending: false })

  return <AdminGrid items={data ?? []} adminKey={ADMIN_KEY} />
}
