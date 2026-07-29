import { createClient } from '@/lib/supabase/server'
import { todayWIB } from '@/lib/date'
import { formatTanggalExport } from '@/lib/export-excel'
import SludgeMovementForm from '@/components/SludgeMovementForm'
import ExportButton from '@/components/ExportButton'
import DeleteButton from '@/components/DeleteButton'

const SLUDGE_COLUMNS = [
  { key: 'tanggal', label: 'Tanggal', format: formatTanggalExport },
  { key: 'area', label: 'Plant' },
  { key: 'jenis', label: 'Jenis' },
  { key: 'jumlah_kg', label: 'Jumlah (Kg)' },
  { key: 'sumber', label: 'Sumber Limbah' },
  { key: 'tanggal_kadaluarsa', label: 'Batas Simpan', format: formatTanggalExport },
  { key: 'perusahaan_pengangkut', label: 'Perusahaan Pengangkut' },
  { key: 'nopol_kendaraan', label: 'Nopol Kendaraan' },
  { key: 'tujuan_penyerahan', label: 'Tujuan Penyerahan' },
  { key: 'bukti_dokumen', label: 'Bukti Dokumen' },
  { key: 'keterangan', label: 'Keterangan' },
]

export const dynamic = 'force-dynamic'

export default async function SludgePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAtasan = myProfile?.role === 'atasan'

  const { data: balanceRows } = await supabase.from('sludge_balance_current').select('*')
  const balanceP1 = balanceRows?.find((r) => r.area === 'P1')?.sisa_kg ?? 0
  const balanceP2 = balanceRows?.find((r) => r.area === 'P2')?.sisa_kg ?? 0

  const { data: movements } = await supabase
    .from('sludge_movements')
    .select('*')
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(30)

  const today = todayWIB()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Logbook sludge & limbah B3</h1>
        <p className="text-sm text-ink/50 mt-1">
          Batas maksimal penyimpanan limbah B3 dihitung otomatis: 90 hari sejak tanggal masuk.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div className="rounded-3xl p-5 bg-lavender/40">
          <p className="text-sm font-medium text-ink/60 mb-2">Sisa limbah — WWTP P1</p>
          <p className="font-display text-3xl font-extrabold text-ink">
            {balanceP1} <span className="text-sm font-medium text-ink/40">kg</span>
          </p>
          <p className="text-xs text-ink/40 mt-1">≈ {(balanceP1 / 1000).toFixed(2)} ton</p>
        </div>
        <div className="rounded-3xl p-5 bg-sky/40">
          <p className="text-sm font-medium text-ink/60 mb-2">Sisa limbah — WWTP P2</p>
          <p className="font-display text-3xl font-extrabold text-ink">
            {balanceP2} <span className="text-sm font-medium text-ink/40">kg</span>
          </p>
          <p className="text-xs text-ink/40 mt-1">≈ {(balanceP2 / 1000).toFixed(2)} ton</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-display text-base font-bold text-ink mb-3">Catat transaksi</h2>
          <SludgeMovementForm />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base font-bold text-ink">Riwayat terakhir</h2>
            <ExportButton data={movements} filename="sludge-limbah-b3" columns={SLUDGE_COLUMNS} />
          </div>
          <div className="bg-white rounded-3xl divide-y divide-ink/5">
            {(movements || []).length === 0 && <p className="text-sm text-ink/40 p-4">Belum ada transaksi.</p>}
            {(movements || []).map((m) => {
              const overdue =
                m.jenis === 'masuk' && m.tanggal_kadaluarsa && m.tanggal_kadaluarsa < today

              return (
                <div key={m.id} className="px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-ink/80 font-medium">
                        <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-cream text-ink/50 mr-1">
                          {m.area}
                        </span>
                        {m.jenis === 'masuk' ? `Masuk · ${m.sumber || '-'}` : `Keluar · ${m.tujuan_penyerahan || '-'}`}
                      </p>
                      <p className="text-xs text-ink/40">
                        {new Date(m.tanggal).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {m.keterangan ? ` · ${m.keterangan}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`font-semibold ${m.jenis === 'masuk' ? 'text-ink' : 'text-emerald-600'}`}>
                        {m.jenis === 'masuk' ? '+' : '-'}
                        {m.jumlah_kg} kg
                        <span className="text-ink/40 font-normal"> · {(m.jumlah_kg / 1000).toFixed(2)} ton</span>
                      </span>
                      {isAtasan && <DeleteButton table="sludge_movements" id={m.id} />}
                    </div>
                  </div>
                  {m.jenis === 'masuk' && m.tanggal_kadaluarsa && (
                    <p className={`text-xs mt-1 ${overdue ? 'text-red-600 font-semibold' : 'text-ink/40'}`}>
                      Batas simpan sampai{' '}
                      {new Date(m.tanggal_kadaluarsa).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {overdue ? ' · sudah lewat batas' : ''}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
