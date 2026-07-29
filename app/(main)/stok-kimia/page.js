import { createClient } from '@/lib/supabase/server'
import { accentAt } from '@/lib/accents'
import StockCard from '@/components/StockCard'
import ChemicalMovementForm from '@/components/ChemicalMovementForm'
import ExportButton from '@/components/ExportButton'
import DeleteButton from '@/components/DeleteButton'

export const dynamic = 'force-dynamic'

export default async function StokKimiaPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAtasan = myProfile?.role === 'atasan'

  const { data: stock } = await supabase
    .from('chemical_stock_current')
    .select('*')
    .order('label')

  const { data: movements } = await supabase
    .from('chemical_movements')
    .select('*, chemicals(label, satuan)')
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(30)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Stok bahan kimia</h1>
        <p className="text-sm text-ink/50 mt-1">
          Sisa stok dan estimasi habis dihitung otomatis dari transaksi masuk/keluar di bawah.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {(stock || []).length === 0 && (
          <p className="text-sm text-ink/40 col-span-full">Belum ada bahan kimia terdaftar.</p>
        )}
        {(stock || []).map((s, i) => (
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

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-display text-base font-bold text-ink mb-3">Catat transaksi</h2>
          <ChemicalMovementForm chemicals={stock || []} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base font-bold text-ink">Riwayat terakhir</h2>
            <ExportButton data={movements} filename="stok-kimia-wwtp" sheetName="Stok Kimia" />
          </div>
          <div className="bg-white rounded-3xl divide-y divide-ink/5">
            {(movements || []).length === 0 && (
              <p className="text-sm text-ink/40 p-4">Belum ada transaksi.</p>
            )}
            {(movements || []).map((m) => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3 text-sm gap-3">
                <div>
                  <p className="text-ink/80 font-medium">
                    {m.chemicals?.label}
                    {m.unit ? <span className="text-ink/40 font-normal"> · {m.unit}</span> : null}
                  </p>
                  <p className="text-xs text-ink/40">
                    {new Date(m.tanggal).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                    {m.keterangan ? ` · ${m.keterangan}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`font-semibold ${m.jenis === 'masuk' ? 'text-emerald-600' : 'text-ink/60'}`}>
                    {m.jenis === 'masuk' ? '+' : '-'}
                    {m.jumlah} {m.chemicals?.satuan}
                  </span>
                  {isAtasan && <DeleteButton table="chemical_movements" id={m.id} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
