import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'

// Semua halaman di dalam sini (dashboard, profile, dll) harus selalu ambil
// data terbaru tiap kali dibuka — bukan versi ke-cache. Tanpa ini, Next.js
// kadang nampilin data lama walau baru aja berhasil disimpan.
export const dynamic = 'force-dynamic'

export default async function MainLayout({ children }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-cream">
      <Navbar fullName={profile?.full_name || user.email} role={profile?.role || 'operator'} />
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
