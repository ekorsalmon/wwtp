import { createClient } from '@/lib/supabase/server'
import LogbookForm from '@/components/LogbookForm'

export default async function LogbookPage() {
  const supabase = await createClient()

  const { data: entries } = await supabase
    .from('logbook_entries')
    .select('*')
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(30)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Logbook</h1>
        <p className="text-sm text-ink/50 mt-1">
          Versi sementara (catatan bebas) — belum disesuaikan ke struktur sheet LOGBOOK asli.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-display text-base font-bold text-ink mb-3">Tambah catatan</h2>
          <LogbookForm />
        </div>

        <div>
          <h2 className="font-display text-base font-bold text-ink mb-3">Riwayat</h2>
          <div className="bg-white rounded-3xl divide-y divide-ink/5">
            {(entries || []).length === 0 && <p className="text-sm text-ink/40 p-4">Belum ada catatan.</p>}
            {(entries || []).map((e) => (
              <div key={e.id} className="px-4 py-3 text-sm">
                <p className="text-xs text-ink/40 mb-1">
                  {new Date(e.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-ink/80">{e.catatan}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
