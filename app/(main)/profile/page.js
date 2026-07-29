import { createClient } from '@/lib/supabase/server'
import { todayWIB } from '@/lib/date'
import ActivityForm from '@/components/ActivityForm'
import IssueForm from '@/components/IssueForm'
import ShiftForm from '@/components/ShiftForm'
import MyShiftPicker from '@/components/MyShiftPicker'
import ExportButton from '@/components/ExportButton'
import DeleteButton from '@/components/DeleteButton'

export const dynamic = 'force-dynamic'

const RUTINITAS_LABEL = { H: 'Harian', M: 'Mingguan', B: 'Bulanan', S: 'Sewaktu-waktu', T: 'Tahunan' }

export default async function ProfilePage({ searchParams }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAtasan = myProfile?.role === 'atasan'

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, role, nama_pekerjaan, divisi, dept, unit_kerja')
    .order('full_name')

  const params = await searchParams
  const targetUserId = params?.user || user.id
  const targetProfile = profiles?.find((p) => p.id === targetUserId) || null
  const isOwn = targetUserId === user.id
  const canEdit = isOwn || isAtasan

  const { data: activities } = await supabase
    .from('work_activities')
    .select('*')
    .eq('user_id', targetUserId)
    .order('tanggal', { ascending: false })
    .limit(30)

  const { data: issues } = await supabase
    .from('work_issues')
    .select('*')
    .eq('user_id', targetUserId)
    .order('tanggal', { ascending: false })
    .limit(10)

  const today = todayWIB()
  const { data: todayShifts } = await supabase
    .from('shifts')
    .select('*, profiles(full_name)')
    .eq('tanggal', today)

  const shiftPagi = (todayShifts || []).filter((s) => s.shift === 'pagi')
  const shiftMalam = (todayShifts || []).filter((s) => s.shift === 'malam')
  const myShift = (todayShifts || []).find((s) => s.user_id === user.id)?.shift || null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Profile & Laporan Aktivitas</h1>
        <p className="text-sm text-ink/50 mt-1">Laporan aktivitas kerja per operator, dan pengaturan shift.</p>
      </div>

      <div>
        <h2 className="font-display text-base font-bold text-ink mb-3">Shift hari ini</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-3xl p-5 bg-sunshine/40">
            <p className="text-sm font-semibold text-ink/70 mb-2">Shift Pagi</p>
            {shiftPagi.length === 0 ? (
              <p className="text-sm text-ink/40">Belum ada yang diatur.</p>
            ) : (
              <ul className="text-sm text-ink space-y-1">
                {shiftPagi.map((s) => (
                  <li key={s.id}>{s.profiles?.full_name}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-3xl p-5 bg-lavender/40">
            <p className="text-sm font-semibold text-ink/70 mb-2">Shift Malam</p>
            {shiftMalam.length === 0 ? (
              <p className="text-sm text-ink/40">Belum ada yang diatur.</p>
            ) : (
              <ul className="text-sm text-ink space-y-1">
                {shiftMalam.map((s) => (
                  <li key={s.id}>{s.profiles?.full_name}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <MyShiftPicker currentShift={myShift} />

        {isAtasan && (
          <div className="mt-4">
            <p className="text-xs text-ink/40 mb-2">Atau atur shift orang lain di sini:</p>
            <ShiftForm profiles={profiles || []} />
          </div>
        )}
      </div>

      <div>
        <h2 className="font-display text-base font-bold text-ink mb-3">Laporan operator</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {(profiles || []).map((p) => (
            <a
              key={p.id}
              href={`/profile?user=${p.id}`}
              className={`text-sm font-semibold px-4 py-2 rounded-full border-2 transition-colors ${
                p.id === targetUserId
                  ? 'bg-brand text-white border-brand'
                  : 'bg-white text-ink/60 border-ink/10 hover:border-brand'
              }`}
            >
              {p.full_name}
            </a>
          ))}
        </div>

        {targetProfile && (
          <div className="bg-white rounded-3xl p-5 mb-6 grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
            <p>
              <span className="text-ink/50">Nama pemangku jabatan: </span>
              <span className="font-medium text-ink">{targetProfile.full_name}</span>
            </p>
            <p>
              <span className="text-ink/50">Nama pekerjaan: </span>
              <span className="font-medium text-ink">{targetProfile.nama_pekerjaan}</span>
            </p>
            <p>
              <span className="text-ink/50">Divisi: </span>
              <span className="font-medium text-ink">{targetProfile.divisi}</span>
            </p>
            <p>
              <span className="text-ink/50">Dept: </span>
              <span className="font-medium text-ink">{targetProfile.dept}</span>
            </p>
            <p>
              <span className="text-ink/50">Unit: </span>
              <span className="font-medium text-ink">{targetProfile.unit_kerja}</span>
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-bold text-ink">Catatan aktivitas kerja</h3>
              <ExportButton data={activities} filename="aktivitas-kerja" sheetName="Aktivitas" />
            </div>
            {canEdit && <ActivityForm targetUserId={targetUserId} />}
            <div className="bg-white rounded-3xl divide-y divide-ink/5 mt-4">
              {(activities || []).length === 0 && <p className="text-sm text-ink/40 p-4">Belum ada aktivitas.</p>}
              {(activities || []).map((a) => (
                <div key={a.id} className="px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-ink/80 font-medium">{a.aktivitas}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      {a.rutinitas && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cream text-ink/60">
                          {RUTINITAS_LABEL[a.rutinitas] || a.rutinitas}
                        </span>
                      )}
                      {canEdit && <DeleteButton table="work_activities" id={a.id} />}
                    </div>
                  </div>
                  <p className="text-xs text-ink/40 mt-1">
                    {new Date(a.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {a.lokasi_kerja ? ` · ${a.lokasi_kerja}` : ''}
                    {a.status === 'proses' ? ' · masih proses' : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-bold text-ink">Kendala</h3>
              <ExportButton data={issues} filename="kendala-operator" sheetName="Kendala" />
            </div>
            {canEdit && <IssueForm targetUserId={targetUserId} />}
            <div className="bg-white rounded-3xl divide-y divide-ink/5 mt-4">
              {(issues || []).length === 0 && <p className="text-sm text-ink/40 p-4">Belum ada kendala tercatat.</p>}
              {(issues || []).map((i) => (
                <div key={i.id} className="px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-ink/80">{i.deskripsi}</p>
                    {canEdit && <DeleteButton table="work_issues" id={i.id} />}
                  </div>
                  <p className="text-xs text-ink/40 mt-1">
                    {new Date(i.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}
                    {i.status === 'selesai' ? 'Selesai' : 'Belum selesai'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
