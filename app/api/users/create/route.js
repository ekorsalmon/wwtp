import { NextResponse } from 'next/server'
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'

export async function POST(request) {
  // 1) Pastikan yang manggil ini beneran login dan role-nya "atasan".
  // Ini cek WAJIB di server — jangan cuma andelin halaman yang nyembunyiin
  // tombolnya, karena endpoint ini bisa dipanggil langsung dari luar.
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Belum login.' }, { status: 401 })
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'atasan') {
    return NextResponse.json({ error: 'Cuma atasan yang boleh bikin akun baru.' }, { status: 403 })
  }

  // 2) Validasi input
  const body = await request.json()
  const { email, password, full_name, role } = body

  if (!email || !password || !full_name || !role) {
    return NextResponse.json({ error: 'Semua field wajib diisi.' }, { status: 400 })
  }

  if (!['operator', 'lab', 'atasan'].includes(role)) {
    return NextResponse.json({ error: 'Role tidak valid.' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password minimal 6 karakter.' }, { status: 400 })
  }

  // 3) Baru di sini service role key dipakai — cuma di server, cuma sampai titik ini.
  const adminClient = createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  })

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 })
  }

  const { error: updateError } = await adminClient
    .from('profiles')
    .update({ role, full_name })
    .eq('id', created.user.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
