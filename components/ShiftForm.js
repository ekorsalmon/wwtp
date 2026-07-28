'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const inputClass =
  'w-full border-2 border-ink/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand transition-colors'

export default function ShiftForm({ profiles }) {
  const today = new Date().toISOString().slice(0, 10)
  const [tanggal, setTanggal] = useState(today)
  const [userId, setUserId] = useState(profiles[0]?.id || '')
  const [shift, setShift] = useState('pagi')
  const [status, setStatus] = useState(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!userId) return

    setSaving(true)
    setStatus(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from('shifts').upsert(
      { tanggal, user_id: userId, shift, input_by: user.id },
      { onConflict: 'tanggal,user_id' }
    )

    setSaving(false)

    if (error) {
      setStatus({ type: 'error', message: 'Gagal menyimpan. Coba lagi.' })
      return
    }

    setStatus({ type: 'success', message: 'Shift tersimpan.' })
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="shift-tanggal">
            Tanggal
          </label>
          <input
            id="shift-tanggal"
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="shift-user">
            Operator
          </label>
          <select id="shift-user" value={userId} onChange={(e) => setUserId(e.target.value)} className={inputClass}>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="shift-value">
            Shift
          </label>
          <select id="shift-value" value={shift} onChange={(e) => setShift(e.target.value)} className={inputClass}>
            <option value="pagi">Pagi</option>
            <option value="malam">Malam</option>
          </select>
        </div>
      </div>

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
        {saving ? 'Menyimpan...' : 'Simpan shift'}
      </button>
    </form>
  )
}
