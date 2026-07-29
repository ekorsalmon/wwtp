'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { todayWIB } from '@/lib/date'

const inputClass =
  'w-full border-2 border-ink/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand transition-colors'

export default function IssueForm({ targetUserId }) {
  const today = todayWIB()
  const [tanggal, setTanggal] = useState(today)
  const [deskripsi, setDeskripsi] = useState('')
  const [status, setStatus] = useState(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!deskripsi.trim()) return

    setSaving(true)
    setStatus(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from('work_issues').insert({
      tanggal,
      user_id: targetUserId,
      deskripsi: deskripsi.trim(),
      status: 'open',
      input_by: user.id,
    })

    setSaving(false)

    if (error) {
      setStatus({ type: 'error', message: 'Gagal menyimpan. Coba lagi.' })
      return
    }

    setStatus({ type: 'success', message: 'Kendala tersimpan.' })
    setDeskripsi('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="issue-tanggal">
          Tanggal
        </label>
        <input
          id="issue-tanggal"
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="issue-deskripsi">
          Kendala
        </label>
        <textarea
          id="issue-deskripsi"
          rows={2}
          required
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          className={inputClass}
          placeholder="Deskripsi kendala yang dihadapi"
        />
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
        {saving ? 'Menyimpan...' : 'Simpan kendala'}
      </button>
    </form>
  )
}
