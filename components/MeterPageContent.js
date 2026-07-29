import { createClient } from '@/lib/supabase/server'
import HourlyReadingForm from '@/components/HourlyReadingForm'
import DailyRecapTable from '@/components/DailyRecapTable'
import ExportButton from '@/components/ExportButton'
import DeleteButton from '@/components/DeleteButton'
import { formatTanggalExport } from '@/lib/export-excel'

export default async function MeterPageContent({ title, description, meterKeys }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAtasan = myProfile?.role === 'atasan'

  const { data: meters } = await supabase.from('meters').select('*').in('key', meterKeys).order('label')

  const { data: recent } = await supabase
    .from('hourly_readings_detail')
    .select('*')
    .in('meter_key', meterKeys)
    .order('tanggal', { ascending: false })
    .order('jam', { ascending: false })
    .limit(30)

  const exportRows = (recent || []).map((r) => {
    const isFlowmeterType = r.jenis === 'flowmeter' || r.jenis === 'flowmeter_harian'
    return {
      Tanggal: formatTanggalExport(r.tanggal),
      Titik: r.label,
      Jam: r.jenis === 'flowmeter_harian' ? '' : `${String(r.jam).padStart(2, '0')}:00`,
      'Angka Meteran / Nilai': r.nilai,
      'Debit / Hasil': isFlowmeterType ? (r.debit !== null && r.debit !== undefined ? r.debit : '') : r.nilai,
      Satuan: r.unit,
    }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
        <p className="text-sm text-ink/50 mt-1">{description}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-display text-base font-bold text-ink mb-3">Catat pembacaan</h2>
          <HourlyReadingForm meters={meters || []} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base font-bold text-ink">Riwayat terakhir</h2>
            <ExportButton data={exportRows} filename={`pembacaan-${title.toLowerCase().replace(/\s+/g, '-')}`} />
          </div>
          <div className="bg-white rounded-3xl divide-y divide-ink/5">
            {(recent || []).length === 0 && <p className="text-sm text-ink/40 p-4">Belum ada pembacaan.</p>}
            {(recent || []).map((r) => {
              const isFlowmeterType = r.jenis === 'flowmeter' || r.jenis === 'flowmeter_harian'
              return (
                <div key={r.id} className="flex items-center justify-between px-4 py-3 text-sm gap-3">
                  <div>
                    <p className="text-ink/80 font-medium">{r.label}</p>
                    <p className="text-xs text-ink/40">
                      {new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      {r.jenis !== 'flowmeter_harian' ? ` · ${String(r.jam).padStart(2, '0')}:00` : ''}
                      {isFlowmeterType ? ` · FM: ${r.nilai}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-semibold text-ink">
                      {isFlowmeterType ? (r.debit !== null ? r.debit : '—') : r.nilai}{' '}
                      <span className="text-ink/40 font-normal">{r.unit}</span>
                    </span>
                    {isAtasan && <DeleteButton table="hourly_readings" id={r.id} />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display text-base font-bold text-ink mb-3">Rekap</h2>
        <DailyRecapTable meters={meters || []} />
      </div>
    </div>
  )
}
