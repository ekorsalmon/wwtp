import { createClient } from '@/lib/supabase/server'
import DataForm from '@/components/DataForm'
import ExportButton from '@/components/ExportButton'
import DeleteButton from '@/components/DeleteButton'
import { formatTanggalExport } from '@/lib/export-excel'

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

  const exportRows = (entries || []).map((e) => ({
    Tanggal: formatTanggalExport(e.tanggal),
    Area: e.area,
    'pH Inlet': e.ph_inlet,
    'pH Outlet': e.ph_outlet,
    'Suhu Inlet (C)': e.temp_inlet,
    'Suhu Outlet (C)': e.temp_outlet,
    'COD Inlet (mg/L)': e.cod_inlet,
    'COD Outlet (mg/L)': e.cod_outlet,
    'DO Inlet (mg/L)': e.do_inlet,
    'DO Outlet (mg/L)': e.do_outlet,
    'TSS Inlet (mg/L)': e.tss_inlet,
    'TSS Outlet (mg/L)': e.tss_outlet,
    'Amoniak Inlet (mg/L)': e.amoniak_inlet,
    'Amoniak Outlet (mg/L)': e.amoniak_outlet,
    'Nitrat Inlet (mg/L)': e.nitrat_inlet,
    'Nitrat Outlet (mg/L)': e.nitrat_outlet,
    'Nitrit Inlet (mg/L)': e.nitrit_inlet,
    'Nitrit Outlet (mg/L)': e.nitrit_outlet,
    'BOD Inlet (mg/L)': e.bod_inlet,
    'BOD Outlet (mg/L)': e.bod_outlet,
    Catatan: e.catatan || '',
  }))

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
        <ExportButton data={exportRows} filename="data-harian-wwtp" />
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
