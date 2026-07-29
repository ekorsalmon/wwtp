import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CreateUserForm from '@/components/CreateUserForm'
import RoleSelect from '@/components/RoleSelect'
import DeleteUserButton from '@/components/DeleteUserButton'

export default async function KelolaUserPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  // Penjagaan di server — bukan cuma nyembunyiin tombol di tampilan.
  // Kalau bukan atasan, langsung dilempar balik ke dashboard.
  if (myProfile?.role !== 'atasan') {
    redirect('/dashboard')
  }

  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .order('full_name')

  const ROLE_LABEL = { operator: 'Operator', lab: 'Tim lab', atasan: 'Atasan' }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Kelola User</h1>
        <p className="text-sm text-ink/50 mt-1">
          Cuma atasan yang bisa buka halaman ini. Bikin akun baru dan atur role tim di sini — gak
          perlu masuk ke Supabase sama sekali.
        </p>
      </div>

      <div>
        <h2 className="font-display text-base font-bold text-ink mb-3">Buat akun baru</h2>
        <CreateUserForm />
      </div>

      <div>
        <h2 className="font-display text-base font-bold text-ink mb-3">Semua akun ({(users || []).length})</h2>
        <div className="bg-white rounded-3xl divide-y divide-ink/5">
          {(users || []).length === 0 && <p className="text-sm text-ink/40 p-4">Belum ada akun.</p>}
          {(users || []).map((u) => (
            <div key={u.id} className="flex items-center justify-between px-4 py-3 text-sm gap-3">
              <div>
                <p className="text-ink/80 font-medium">{u.full_name}</p>
                <p className="text-xs text-ink/40">
                  Saat ini: {ROLE_LABEL[u.role] || u.role}
                  {u.created_at
                    ? ` · Dibuat ${new Date(u.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}`
                    : ''}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <RoleSelect userId={u.id} currentRole={u.role} disabled={u.id === user.id} />
                {u.id !== user.id && <DeleteUserButton userId={u.id} fullName={u.full_name} />}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-ink/40 mt-2">
          Role dan penghapusan akun sendiri gak bisa dilakukan dari sini (biar gak ke-lock keluar
          gak sengaja).
        </p>
      </div>
    </div>
  )
}
