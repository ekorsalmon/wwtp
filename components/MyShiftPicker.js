'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { todayWIB } from '@/lib/date'

export default function MyShiftPicker({ currentShift }) {
  const [localShift, setLocalShift] = useState(currentShift)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  async function pick(shift) {
    setSaving(true)
    setStatus(null)
    setLocalShift(shift) // langsung keliatan kepilih, gak nunggu server

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('shifts')
      .upsert({ tanggal: todayWIB(), user_id: user.id, shift, input_by: user.id }, { onConflict: 'tanggal,user_id' })

    setSaving(false)

    if (error) {
      setLocalShift(currentShift)
      setStatus({ type: 'error', message: 'Gagal menyimpan shift.' })
      return
    }

    setStatus({ type: 'success', message: 'Tersimpan.' })
    router.refresh()
  }

  async function remove() {
    setSaving(true)
    setStatus(null)
    const prevShift = localShift
    setLocalShift(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('shifts')
      .delete()
      .eq('tanggal', todayWIB())
      .eq('user_id', user.id)

    setSaving(false)

    if (error) {
      setLocalShift(prevShift)
      setStatus({ type: 'error', message: 'Gagal menghapus shift.' })
      return
    }

    setStatus({ type: 'success', message: 'Shift dibatalkan.' })
    router.refresh()
  }

  return (
    <div className="bg-white rounded-3xl p-5">
      <p className="text-sm font-semibold text-ink/70 mb-3">
        Shift kamu hari ini{localShift ? `: ${localShift === 'pagi' ? 'Pagi' : 'Malam'}` : ' (belum dipilih)'}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => pick('pagi')}
          disabled={saving}
          className={`text-sm font-semibold px-5 py-2 rounded-full transition-colors disabled:opacity-50 ${
            localShift === 'pagi' ? 'bg-sunshine text-ink' : 'bg-cream text-ink/60 hover:bg-ink/10'
          }`}
        >
          Pagi
        </button>
        <button
          type="button"
          onClick={() => pick('malam')}
          disabled={saving}
          className={`text-sm font-semibold px-5 py-2 rounded-full transition-colors disabled:opacity-50 ${
            localShift === 'malam' ? 'bg-lavender text-ink' : 'bg-cream text-ink/60 hover:bg-ink/10'
          }`}
        >
          Malam
        </button>
        {localShift && (
          <button
            type="button"
            onClick={remove}
            disabled={saving}
            className="text-xs font-semibold text-ink/30 hover:text-coral transition-colors disabled:opacity-40"
          >
            Batalkan
          </button>
        )}
        {status && (
          <span className={`text-xs font-medium ${status.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
            {status.message}
          </span>
        )}
      </div>
    </div>
  )
}
