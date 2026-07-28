import { createClient } from '@/lib/supabase/server'
import { evaluateStatus, unitTipeFor } from '@/lib/baku-mutu'
import LabAnalysisForm from '@/components/LabAnalysisForm'
import ExportButton from '@/components/ExportButton'
import DeleteButton from '@/components/DeleteButton'

const STATUS_LABEL = {
  ok: { text: 'Sesuai', className: 'bg-mint text-ink' },
  violation: { text: 'Di luar', className: 'bg-coral text-white' },
  unknown: { text: '-', className: 'bg-cream text-ink/40' },
}

export default async function AnalisaLabPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAtasan = myProfile?.role === 'atasan'

  const { data: parameters } = await supabase.from('parameters').select('*').order('key')
  const { data: standar } = await supabase.from('baku_mutu').select('*')

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
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-bold text-ink">Data terakhir</h2>
          <ExportButton data={recent} filename="analisa-lab-wwtp" sheetName="Analisa Lab" />
        </div>
        <div className="bg-white rounded-3xl overflow-hidden">
          {(recent || []).length === 0 ? (
            <p className="text-sm text-ink/40 p-4">Belum ada data.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-cream text-xs text-ink/50">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold">Tanggal</th>
                  <th className="text-left px-4 py-2 font-semibold">Shift</th>
                  <th className="text-left px-4 py-2 font-semibold">Unit</th>
                  <th className="text-left px-4 py-2 font-semibold">Tahap</th>
                  <th className="text-left px-4 py-2 font-semibold">Parameter</th>
                  <th className="text-right px-4 py-2 font-semibold">Nilai</th>
                  <th className="text-center px-4 py-2 font-semibold">Status</th>
                  {isAtasan && <th className="px-4 py-2"></th>}
                </tr>
              </thead>
              <tbody>
                {(recent || []).map((r) => {
                  const status =
                    r.tahap_proses === 'Outlet'
                      ? evaluateStatus(r.parameter, r.nilai, standar, unitTipeFor(r.unit))
                      : 'unknown'
                  const s = STATUS_LABEL[status] || STATUS_LABEL.unknown
                  return (
                    <tr key={r.id} className="border-t border-ink/5">
                      <td className="px-4 py-2 text-ink/70">
                        {new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-4 py-2 text-ink/70">{r.shift ? `Shift ${r.shift}` : '—'}</td>
                      <td className="px-4 py-2 text-ink/70">{r.unit}</td>
                      <td className="px-4 py-2 text-ink/70">{r.tahap_proses}</td>
                      <td className="px-4 py-2 text-ink/70">{r.parameter}</td>
                      <td className="px-4 py-2 text-right font-medium text-ink">{r.nilai ?? '—'}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${s.className}`}>
                          {s.text}
                        </span>
                      </td>
                      {isAtasan && (
                        <td className="px-4 py-2 text-right">
                          <DeleteButton table="lab_analysis" id={r.id} />
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
