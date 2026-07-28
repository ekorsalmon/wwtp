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
        <h1 className="text-xl font-semibold text-slate-900">Hasil analisa lab</h1>
        <p className="text-sm text-slate-500 mt-1">
          Input per unit dan tahap proses. Kombinasi tanggal, unit, tahap, dan parameter yang sama
          akan memperbarui nilai lama, bukan bikin baris dobel.
        </p>
      </div>

      <LabAnalysisForm parameters={parameters || []} />

      <div>
        <h2 className="text-sm font-medium text-slate-700 mb-3">Data terakhir</h2>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {(recent || []).length === 0 ? (
            <p className="text-sm text-slate-400 p-4">Belum ada data.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="text-left px-4 py-2">Tanggal</th>
                  <th className="text-left px-4 py-2">Unit</th>
                  <th className="text-left px-4 py-2">Tahap</th>
                  <th className="text-left px-4 py-2">Parameter</th>
                  <th className="text-right px-4 py-2">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {(recent || []).map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-4 py-2">
                      {new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-2">{r.unit}</td>
                    <td className="px-4 py-2">{r.tahap_proses}</td>
                    <td className="px-4 py-2">{r.parameter}</td>
                    <td className="px-4 py-2 text-right">{r.nilai ?? '—'}</td>
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
