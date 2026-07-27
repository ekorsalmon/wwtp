import { createClient } from '@/lib/supabase/server'
import { evaluateStatus } from '@/lib/baku-mutu'
import StatusCard from '@/components/StatusCard'
import TrendChart from '@/components/TrendChart'
import StockCard from '@/components/StockCard'

const OUTLET_PARAMS = [
  { key: 'ph', label: 'pH outlet', unit: '' },
  { key: 'cod', label: 'COD outlet', unit: 'mg/L' },
  { key: 'tss', label: 'TSS outlet', unit: 'mg/L' },
  { key: 'do', label: 'DO outlet', unit: 'mg/L' },
]

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: entries } = await supabase
    .from('daily_water_quality')
    .select('*')
    .order('tanggal', { ascending: false })
    .limit(15)

  const { data: standar } = await supabase.from('baku_mutu').select('*')
  const { data: stock } = await supabase.from('chemical_stock_current').select('*').order('label')

  const latest = entries?.[0]
  const chronological = [...(entries || [])].reverse()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard WWTP P1</h1>
        <p className="text-sm text-slate-500 mt-1">
          {latest
            ? `Data terakhir: ${new Date(latest.tanggal).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })} · ${latest.area}`
            : 'Belum ada data. Mulai isi lewat menu "Input data".'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {OUTLET_PARAMS.map((p) => {
          const value = latest?.[`${p.key}_outlet`]
          const status = evaluateStatus(p.key, value, standar)
          return <StatusCard key={p.key} label={p.label} value={value} unit={p.unit} status={status} />
        })}
      </div>

      <div>
        <h2 className="text-sm font-medium text-slate-700 mb-3">Tren COD, 15 entri terakhir</h2>
        {chronological.length > 0 ? (
          <TrendChart data={chronological} />
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-400">
            Belum ada data untuk ditampilkan.
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-medium text-slate-700 mb-3">Stok bahan kimia</h2>
        {stock && stock.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stock.map((s) => (
              <StockCard key={s.key} label={s.label} unit={s.unit} stok={s.stok} stokMinimum={s.stok_minimum} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-400">
            Belum ada data stok.
          </div>
        )}
      </div>
    </div>
  )
}
