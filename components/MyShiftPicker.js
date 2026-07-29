'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { todayWIB } from '@/lib/date'

export default function MyShiftPicker({ currentShift }) {
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function pick(shift) {
    setSaving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('shifts')
      .upsert({ tanggal: todayWIB(), user_id: user.id, shift, input_by: user.id }, { onConflict: 'tanggal,user_id' })

    setSaving(false)

    if (error) {
      alert('Gagal menyimpan shift.')
      return
    }

    router.refresh()
  }

  return (
    <div className="bg-white rounded-3xl p-5">
      <p className="text-sm font-semibold text-ink/70 mb-3">
        Shift kamu hari ini{currentShift ? `: ${currentShift === 'pagi' ? 'Pagi' : 'Malam'}` : ' (belum dipilih)'}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => pick('pagi')}
          disabled={saving}
          className={`text-sm font-semibold px-5 py-2 rounded-full transition-colors disabled:opacity-50 ${
            currentShift === 'pagi' ? 'bg-sunshine text-ink' : 'bg-cream text-ink/60 hover:bg-ink/10'
          }`}
        >
          Pagi
        </button>
        <button
          type="button"
          onClick={() => pick('malam')}
          disabled={saving}
          className={`text-sm font-semibold px-5 py-2 rounded-full transition-colors disabled:opacity-50 ${
            currentShift === 'malam' ? 'bg-lavender text-ink' : 'bg-cream text-ink/60 hover:bg-ink/10'
          }`}
        >
          Malam
        </button>
      </div>
    </div>
  )
}
