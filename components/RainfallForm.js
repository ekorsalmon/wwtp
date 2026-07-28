'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const inputClass =
  'w-full border-2 border-ink/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand transition-colors'

export default function RainfallForm() {
  const today = new Date().toISOString().slice(0, 10)
  const [tanggal, setTanggal] = useState(today)
  const [libur, setLibur] = useState(false)
  const [nilai, setNilai] = useState('')
  const [status, setStatus] = useState(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from('rainfall').upsert(
      {
        tanggal,
        libur,
        curah_hujan_mm: libur ? null : nilai === '' ? null : Number(nilai),
        input_by: user.id,
      },
      { onConflict: 'tanggal' }
    )

    setSaving(false)

    if (error) {
      setStatus({ type: 'error', message: 'Gagal menyimpan. Coba lagi.' })
      return
    }

    setStatus({ type: 'success', message: 'Data tersimpan.' })
    setNilai('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="tanggal">
          Tanggal
        </label>
        <input
          id="tanggal"
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className={inputClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink/70">
        <input type="checkbox" checked={libur} onChange={(e) => setLibur(e.target.checked)} className="rounded" />
        Hari libur (gak ada pencatatan)
      </label>

      {!libur && (
        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="nilai">
            Curah hujan (mm)
          </label>
          <input
            id="nilai"
            type="number"
            step="0.1"
            value={nilai}
            onChange={(e) => setNilai(e.target.value)}
            className={inputClass}
          />
        </div>
      )}

      {status && (
        <p className={`text-sm font-medium ${status.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="bg-brand text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-brand-dark transition-colors disabled:opacity-50"
      >
        {saving ? 'Menyimpan...' : 'Simpan data'}
      </button>
    </form>
  )
}
