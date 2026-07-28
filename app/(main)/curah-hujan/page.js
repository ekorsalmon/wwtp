import { createClient } from '@/lib/supabase/server'
import RainfallForm from '@/components/RainfallForm'

export default async function CurahHujanPage() {
  const supabase = await createClient()

  const { data: recent } = await supabase
    .from('rainfall')
    .select('*')
    .order('tanggal', { ascending: false })
    .limit(31)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Curah hujan</h1>
        <p className="text-sm text-ink/50 mt-1">Pencatatan curah hujan harian area WWTP P1.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-display text-base font-bold text-ink mb-3">Catat hari ini</h2>
          <RainfallForm />
        </div>

        <div>
          <h2 className="font-display text-base font-bold text-ink mb-3">Riwayat terakhir</h2>
          <div className="bg-white rounded-3xl divide-y divide-ink/5">
            {(recent || []).length === 0 && <p className="text-sm text-ink/40 p-4">Belum ada data.</p>}
            {(recent || []).map((r) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-ink/70">
                  {new Date(r.tanggal).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <span className="font-semibold text-ink">
                  {r.libur ? (
                    <span className="text-ink/40 font-normal">Libur</span>
                  ) : (
                    <>
                      {r.curah_hujan_mm ?? '—'} <span className="text-ink/40 font-normal">mm</span>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
