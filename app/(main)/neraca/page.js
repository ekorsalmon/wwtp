import { createClient } from '@/lib/supabase/server'
import ExportButton from '@/components/ExportButton'

export const dynamic = 'force-dynamic'

const NERACA_COLUMNS = [
  { key: 'label', label: 'Nama B3' },
  { key: 'stok_bulan_lalu', label: 'Stok Bulan Lalu' },
  { key: 'penambahan', label: 'Penambahan' },
  { key: 'pemakaian', label: 'Pemakaian' },
  { key: 'sisa', label: 'Sisa' },
]

function Table({ title, unitLabel, rows, filename }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-base font-bold text-ink">{title}</h2>
        <ExportButton data={rows} filename={filename} columns={NERACA_COLUMNS} />
      </div>
      <div className="bg-white rounded-3xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-xs text-ink/50">
            <tr>
              <th className="text-left px-4 py-2 font-semibold">Nama B3</th>
              <th className="text-right px-4 py-2 font-semibold">Stok bulan lalu</th>
              <th className="text-right px-4 py-2 font-semibold">Penambahan</th>
              <th className="text-right px-4 py-2 font-semibold">Pemakaian</th>
              <th className="text-right px-4 py-2 font-semibold">Sisa</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-t border-ink/5">
                <td className="px-4 py-2 text-ink/80">{r.label}</td>
                <td className="px-4 py-2 text-right text-ink/60">{r.stok_bulan_lalu}</td>
                <td className="px-4 py-2 text-right text-ink/60">{r.penambahan}</td>
                <td className="px-4 py-2 text-right text-ink/60">{r.pemakaian}</td>
                <td className="px-4 py-2 text-right font-semibold text-ink">
                  {r.sisa} <span className="text-ink/40 font-normal">{unitLabel}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default async function NeracaPage() {
  const supabase = await createClient()

  const { data } = await supabase.from('chemical_neraca_bulanan').select('*').order('label')

  const pengujian = (data || []).filter((r) => r.satuan === 'pcs')
  const proses = (data || []).filter((r) => r.satuan === 'kg')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Neraca bahan kimia</h1>
        <p className="text-sm text-ink/50 mt-1">
          Rekap bulan berjalan, dihitung otomatis dari transaksi di halaman{' '}
          <a href="/stok-kimia" className="text-brand font-semibold hover:underline">
            Stok Kimia
          </a>
          .
        </p>
      </div>

      <Table title="Bahan kimia pengujian (reagen lab)" unitLabel="pcs" rows={pengujian} filename="neraca-reagen-lab" />
      <Table title="Bahan kimia proses WWTP" unitLabel="kg" rows={proses} filename="neraca-bahan-proses" />
    </div>
  )
}
