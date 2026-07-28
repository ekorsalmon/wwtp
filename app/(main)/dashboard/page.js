import { createClient } from '@/lib/supabase/server'
import { evaluateStatus } from '@/lib/baku-mutu'
import { accentAt } from '@/lib/accents'
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
  const { data: stock } = await supabase
    .from('chemical_stock_current')
    .select('*')
    .in('key', ['pac', 'naoh', 'polymer', 'kaporit', 'dca'])
    .order('label')

  const { data: kendala } = await supabase
    .from('work_issues')
    .select('*, profiles(full_name)')
    .order('tanggal', { ascending: false })
    .limit(5)

  const latest = entries?.[0]
  const chronological = [...(entries || [])].reverse()

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Dashboard WWTP P1</h1>
        <p className="text-sm text-ink/50 mt-1">
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
        {OUTLET_PARAMS.map((p, i) => {
          const value = latest?.[`${p.key}_outlet`]
          const status = evaluateStatus(p.key, value, standar)
          return (
            <StatusCard
              key={p.key}
              label={p.label}
              value={value}
              unit={p.unit}
              status={status}
              accent={accentAt(i)}
            />
          )
        })}
      </div>

      <div>
        <h2 className="font-display text-base font-bold text-ink mb-3">Tren parameter outlet, 15 entri terakhir</h2>
        {chronological.length > 0 ? (
          <TrendChart data={chronological} />
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center text-sm text-ink/40">
            Belum ada data untuk ditampilkan.
          </div>
        )}
      </div>

      <div>
        <h2 className="font-display text-base font-bold text-ink mb-3">Kendala terbaru</h2>
        <div className="bg-white rounded-3xl divide-y divide-ink/5">
          {(kendala || []).length === 0 ? (
            <p className="text-sm text-ink/40 p-4">Belum ada kendala tercatat.</p>
          ) : (
            kendala.map((k) => (
              <div key={k.id} className="px-4 py-3 text-sm flex items-center justify-between gap-3">
                <div>
                  <p className="text-ink/80">{k.deskripsi}</p>
                  <p className="text-xs text-ink/40 mt-1">
                    {new Date(k.tanggal).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                    {' · '}
                    {k.profiles?.full_name}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${
                    k.status === 'selesai' ? 'bg-mint text-ink' : 'bg-coral text-white'
                  }`}
                >
                  {k.status === 'selesai' ? 'Selesai' : 'Belum selesai'}
                </span>
              </div>
            ))
          )}
        </div>
        <a href="/profile" className="text-xs text-brand font-semibold hover:underline mt-2 inline-block">
          Lihat & tambah kendala →
        </a>
      </div>

      <div>
        <h2 className="font-display text-base font-bold text-ink mb-3">Stok bahan kimia</h2>
        {stock && stock.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stock.map((s, i) => (
              <StockCard
                key={s.key}
                label={s.label}
                satuan={s.satuan}
                stok={s.stok}
                estimasiMinggu={s.estimasi_minggu}
                accent={accentAt(i)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center text-sm text-ink/40">Belum ada data stok.</div>
        )}
      </div>
    </div>
  )
}
