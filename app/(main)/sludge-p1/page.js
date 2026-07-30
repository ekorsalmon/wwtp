import { createClient } from '@/lib/supabase/server'
import { todayWIB } from '@/lib/date'
import { formatTanggalExport } from '@/lib/export-excel'
import SludgeMovementForm from '@/components/SludgeMovementForm'
import ExportButton from '@/components/ExportButton'
import DeleteButton from '@/components/DeleteButton'

export const dynamic = 'force-dynamic'

const AREA = 'P1'

export default async function SludgeP1Page() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAtasan = myProfile?.role === 'atasan'

  const { data: balanceRows } = await supabase.from('sludge_balance_current').select('*')
  const balance = balanceRows?.find((r) => r.area === AREA)?.sisa_kg ?? 0

  const { data: movements } = await supabase
    .from('sludge_movements')
    .select('*')
    .eq('area', AREA)
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(30)

  const today = todayWIB()

  const sludgeExportRows = (movements || []).map((m) => ({
    Tanggal: formatTanggalExport(m.tanggal),
    Plant: m.area,
    Jenis: m.jenis,
    'Jumlah (Kg)': m.jumlah_kg,
    'Sumber Limbah': m.sumber || '',
    'Batas Simpan': formatTanggalExport(m.tanggal_kadaluarsa),
    'Perusahaan Pengangkut': m.perusahaan_pengangkut || '',
    'Nopol Kendaraan': m.nopol_kendaraan || '',
    'Tujuan Penyerahan': m.tujuan_penyerahan || '',
    'Bukti Dokumen': m.bukti_dokumen || '',
    Keterangan: m.keterangan || '',
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">
          Logbook sludge & limbah B3 — WWTP P1
        </h1>
        <p className="text-sm text-ink/50 mt-1">
          Batas maksimal penyimpanan limbah B3 dihitung otomatis: 90 hari sejak tanggal masuk.
        </p>
      </div>

      <div className="max-w-xs">
        <div className="rounded-3xl p-5 bg-lavender/40">
          <p className="text-sm font-medium text-ink/60 mb-2">Sisa limbah — WWTP P1</p>
          <p className="font-display text-3xl font-extrabold text-ink">
            {balance} <span className="text-sm font-medium text-ink/40">kg</span>
          </p>
          <p className="text-xs text-ink/40 mt-1">≈ {(balance / 1000).toFixed(2)} ton</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-display text-base font-bold text-ink mb-3">Catat transaksi</h2>
          <SludgeMovementForm fixedArea={AREA} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base font-bold text-ink">Riwayat terakhir</h2>
            <ExportButton data={sludgeExportRows} filename="sludge-limbah-b3-p1" />
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
