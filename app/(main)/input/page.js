import { createClient } from '@/lib/supabase/server'
import DataForm from '@/components/DataForm'
import ExportButton from '@/components/ExportButton'
import DeleteButton from '@/components/DeleteButton'
import { formatTanggalExport } from '@/lib/export-excel'

const DATA_COLUMNS = [
  { key: 'tanggal', label: 'Tanggal', format: formatTanggalExport },
  { key: 'area', label: 'Area' },
  { key: 'ph_inlet', label: 'pH Inlet' },
  { key: 'ph_outlet', label: 'pH Outlet' },
  { key: 'temp_inlet', label: 'Suhu Inlet (C)' },
  { key: 'temp_outlet', label: 'Suhu Outlet (C)' },
  { key: 'cod_inlet', label: 'COD Inlet (mg/L)' },
  { key: 'cod_outlet', label: 'COD Outlet (mg/L)' },
  { key: 'do_inlet', label: 'DO Inlet (mg/L)' },
  { key: 'do_outlet', label: 'DO Outlet (mg/L)' },
  { key: 'tss_inlet', label: 'TSS Inlet (mg/L)' },
  { key: 'tss_outlet', label: 'TSS Outlet (mg/L)' },
  { key: 'amoniak_inlet', label: 'Amoniak Inlet (mg/L)' },
  { key: 'amoniak_outlet', label: 'Amoniak Outlet (mg/L)' },
  { key: 'nitrat_inlet', label: 'Nitrat Inlet (mg/L)' },
  { key: 'nitrat_outlet', label: 'Nitrat Outlet (mg/L)' },
  { key: 'nitrit_inlet', label: 'Nitrit Inlet (mg/L)' },
  { key: 'nitrit_outlet', label: 'Nitrit Outlet (mg/L)' },
  { key: 'bod_inlet', label: 'BOD Inlet (mg/L)' },
  { key: 'bod_outlet', label: 'BOD Outlet (mg/L)' },
  { key: 'catatan', label: 'Catatan' },
]

export const dynamic = 'force-dynamic'

export default async function InputPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAtasan = myProfile?.role === 'atasan'

  const { data: entries } = await supabase
    .from('daily_water_quality')
    .select('*')
    .order('tanggal', { ascending: false })
    .limit(30)

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink mb-1">Input data harian</h1>
      <p className="text-sm text-ink/50 mb-6">
        Isi hasil pengukuran inlet dan outlet untuk hari ini. Kalau tanggal dan area sama dipakai
        lagi, data lama akan diperbarui (bukan dobel).
      </p>
      <DataForm />

      <div className="flex items-center justify-between mt-10 mb-3">
        <h2 className="font-display text-base font-bold text-ink">Riwayat terakhir</h2>
        <ExportButton data={entries} filename="data-harian-wwtp" columns={DATA_COLUMNS} />
      </div>
      <div className="bg-white rounded-3xl divide-y divide-ink/5">
        {(entries || []).length === 0 && <p className="text-sm text-ink/40 p-4">Belum ada data.</p>}
        {(entries || []).map((e) => (
          <div key={e.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <p className="text-ink/80 font-medium">{e.area}</p>
              <p className="text-xs text-ink/40">
                {new Date(e.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                {' · '}pH {e.ph_outlet ?? '—'} · COD {e.cod_outlet ?? '—'} · TSS {e.tss_outlet ?? '—'} · DO {e.do_outlet ?? '—'}
              </p>
            </div>
            {isAtasan && <DeleteButton table="daily_water_quality" id={e.id} />}
          </div>
        ))}
      </div>
    </div>
  )
}
