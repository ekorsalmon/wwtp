import { createClient } from '@/lib/supabase/server'
import HourlyReadingForm from '@/components/HourlyReadingForm'
import DailyRecapTable from '@/components/DailyRecapTable'

export default async function PembacaanJamPage() {
  const supabase = await createClient()

  const { data: meters } = await supabase.from('meters').select('*').order('label')

  const { data: recent } = await supabase
    .from('hourly_readings_detail')
    .select('*')
    .order('tanggal', { ascending: false })
    .order('jam', { ascending: false })
    .limit(30)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Pembacaan flowmeter & SV30</h1>
        <p className="text-sm text-ink/50 mt-1">
          Catat pembacaan tiap kali cek meteran. Jam dan tanggal yang sama akan memperbarui nilai
          lama, bukan bikin baris dobel. Debit flowmeter dan rata-rata SV30 dihitung otomatis.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-display text-base font-bold text-ink mb-3">Catat pembacaan</h2>
          <HourlyReadingForm meters={meters || []} />
        </div>

        <div>
          <h2 className="font-display text-base font-bold text-ink mb-3">Riwayat terakhir</h2>
          <div className="bg-white rounded-3xl divide-y divide-ink/5">
            {(recent || []).length === 0 && <p className="text-sm text-ink/40 p-4">Belum ada pembacaan.</p>}
            {(recent || []).map((r) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="text-ink/80 font-medium">{r.label}</p>
                  <p className="text-xs text-ink/40">
                    {new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} ·{' '}
                    {String(r.jam).padStart(2, '0')}:00
                    {r.jenis === 'flowmeter' ? ` · FM: ${r.nilai}` : ''}
                  </p>
                </div>
                <span className="font-semibold text-ink">
                  {r.jenis === 'flowmeter' ? (r.debit !== null ? r.debit : '—') : r.nilai}{' '}
                  <span className="text-ink/40 font-normal">{r.unit}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display text-base font-bold text-ink mb-3">Rekap satu hari</h2>
        <DailyRecapTable meters={meters || []} />
      </div>
    </div>
  )
}
