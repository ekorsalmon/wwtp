import { createClient } from '@/lib/supabase/server'
import LabAnalysisForm from '@/components/LabAnalysisForm'

export default async function AnalisaLabPage() {
  const supabase = await createClient()

  const { data: parameters } = await supabase.from('baku_mutu').select('*').order('parameter')

  const { data: recent } = await supabase
    .from('lab_analysis')
    .select('*')
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(30)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Hasil analisa lab</h1>
        <p className="text-sm text-ink/50 mt-1">
          Input per unit dan tahap proses. Kombinasi tanggal, unit, tahap, dan parameter yang sama
          akan memperbarui nilai lama, bukan bikin baris dobel.
        </p>
      </div>

      <LabAnalysisForm parameters={parameters || []} />

      <div>
        <h2 className="font-display text-base font-bold text-ink mb-3">Data terakhir</h2>
        <div className="bg-white rounded-3xl overflow-hidden">
          {(recent || []).length === 0 ? (
            <p className="text-sm text-ink/40 p-4">Belum ada data.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-cream text-xs text-ink/50">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold">Tanggal</th>
                  <th className="text-left px-4 py-2 font-semibold">Unit</th>
                  <th className="text-left px-4 py-2 font-semibold">Tahap</th>
                  <th className="text-left px-4 py-2 font-semibold">Parameter</th>
                  <th className="text-right px-4 py-2 font-semibold">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {(recent || []).map((r) => (
                  <tr key={r.id} className="border-t border-ink/5">
                    <td className="px-4 py-2 text-ink/70">
                      {new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-2 text-ink/70">{r.unit}</td>
                    <td className="px-4 py-2 text-ink/70">{r.tahap_proses}</td>
                    <td className="px-4 py-2 text-ink/70">{r.parameter}</td>
                    <td className="px-4 py-2 text-right font-medium text-ink">{r.nilai ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
