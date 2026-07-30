import { createClient } from '@/lib/supabase/server'
import { evaluateStatus } from '@/lib/baku-mutu'
import { accentAt } from '@/lib/accents'
import { monthRangeWIB } from '@/lib/date'
import StatusCard from '@/components/StatusCard'
import TrendChart from '@/components/TrendChart'
import StockCard from '@/components/StockCard'
import AttendanceGrid from '@/components/AttendanceGrid'
import ExportButton from '@/components/ExportButton'
import DeleteButton from '@/components/DeleteButton'
import { formatTanggalExport } from '@/lib/export-excel'

export const dynamic = 'force-dynamic'

const OUTLET_PARAMS = [
  { key: 'ph', label: 'pH outlet', unit: '' },
  { key: 'cod', label: 'COD outlet', unit: 'mg/L' },
  { key: 'tss', label: 'TSS outlet', unit: 'mg/L' },
  { key: 'do', label: 'DO outlet', unit: 'mg/L' },
]

export default async function DashboardPage() {
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

  const { data: profiles } = await supabase.from('profiles').select('id, full_name').order('full_name')

  const { year, month, daysInMonth, monthStart, monthEnd } = monthRangeWIB()

  const { data: monthShifts } = await supabase
    .from('shifts')
    .select('*, profiles(full_name)')
    .gte('tanggal', monthStart)
    .lte('tanggal', monthEnd)

  const shiftMap = {}
  ;(monthShifts || []).forEach((s) => {
    const day = Number(s.tanggal.slice(8, 10))
    if (!shiftMap[s.user_id]) shiftMap[s.user_id] = {}
    shiftMap[s.user_id][day] = s.shift
  })

  const sundays = new Set()
  for (let d = 1; d <= daysInMonth; d++) {
    if (new Date(Date.UTC(year, month, d)).getUTCDay() === 0) sundays.add(d)
  }

  const latest = entries?.[0]
  const chronological = [...(entries || [])].reverse()

  const kendalaExportRows = (kendala || []).map((k) => ({
    Tanggal: formatTanggalExport(k.tanggal),
    Kendala: k.deskripsi,
    'Dilaporkan Oleh': k.profiles?.full_name || '',
    Status: k.status === 'selesai' ? 'Selesai' : 'Belum Selesai',
  }))

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Dashboard Environmental Sustainability (ES)</h1>
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
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-bold text-ink">Kendala terbaru</h2>
          <ExportButton data={kendalaExportRows} filename="kendala-terbaru" />
        </div>
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
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      k.status === 'selesai' ? 'bg-mint text-ink' : 'bg-coral text-white'
                    }`}
                  >
                    {k.status === 'selesai' ? 'Selesai' : 'Belum selesai'}
                  </span>
                  {(isAtasan || k.user_id === user.id) && <DeleteButton table="work_issues" id={k.id} />}
                </div>
              </div>
            ))
          )}
        </div>
        <a href="/profile" className="text-xs text-brand font-semibold hover:underline mt-2 inline-block">
          Lihat & tambah kendala →
        </a>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-bold text-ink">Kehadiran & shift bulan ini</h2>
          <ExportButton
            data={(monthShifts || []).map((s) => ({
              Tanggal: formatTanggalExport(s.tanggal),
              Nama: s.profiles?.full_name,
              Shift: s.shift === 'pagi' ? 'Pagi' : 'Malam',
            }))}
            filename="kehadiran-shift"
          />
        </div>
        {profiles && profiles.length > 0 ? (
          <AttendanceGrid profiles={profiles} shiftMap={shiftMap} daysInMonth={daysInMonth} sundays={sundays} />
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center text-sm text-ink/40">Belum ada operator terdaftar.</div>
        )}
        <a href="/profile" className="text-xs text-brand font-semibold hover:underline mt-2 inline-block">
          Atur shift →
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
