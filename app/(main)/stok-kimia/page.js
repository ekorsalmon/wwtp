import { createClient } from '@/lib/supabase/server'
import StockCard from '@/components/StockCard'
import ChemicalMovementForm from '@/components/ChemicalMovementForm'

export default async function StokKimiaPage() {
  const supabase = await createClient()

  const { data: stock } = await supabase
    .from('chemical_stock_current')
    .select('*')
    .order('label')

  const { data: movements } = await supabase
    .from('chemical_movements')
    .select('*, chemicals(label, unit)')
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Stok bahan kimia</h1>
        <p className="text-sm text-slate-500 mt-1">
          Sisa stok dihitung otomatis dari transaksi masuk dan keluar di bawah.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {(stock || []).length === 0 && (
          <p className="text-sm text-slate-400 col-span-full">Belum ada bahan kimia terdaftar.</p>
        )}
        {(stock || []).map((s) => (
          <StockCard key={s.key} label={s.label} unit={s.unit} stok={s.stok} stokMinimum={s.stok_minimum} />
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm font-medium text-slate-700 mb-3">Catat transaksi</h2>
          <ChemicalMovementForm chemicals={stock || []} />
        </div>

        <div>
          <h2 className="text-sm font-medium text-slate-700 mb-3">Riwayat terakhir</h2>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {(movements || []).length === 0 && (
              <p className="text-sm text-slate-400 p-4">Belum ada transaksi.</p>
            )}
            {(movements || []).map((m) => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="text-slate-800">{m.chemicals?.label}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(m.tanggal).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                    {m.keterangan ? ` · ${m.keterangan}` : ''}
                  </p>
                </div>
                <span className={m.jenis === 'masuk' ? 'text-emerald-600' : 'text-slate-600'}>
                  {m.jenis === 'masuk' ? '+' : '-'}
                  {m.jumlah} {m.chemicals?.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
