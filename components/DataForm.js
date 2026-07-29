'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { todayWIB } from '@/lib/date'

const FIELDS = [
  { key: 'ph', label: 'pH' },
  { key: 'temp', label: 'Suhu (C)' },
  { key: 'cod', label: 'COD (mg/L)' },
  { key: 'do', label: 'DO (mg/L)' },
  { key: 'tss', label: 'TSS (mg/L)' },
  { key: 'amoniak', label: 'Amoniak (mg/L)' },
  { key: 'nitrat', label: 'Nitrat (mg/L)' },
  { key: 'nitrit', label: 'Nitrit (mg/L)' },
  { key: 'bod', label: 'BOD (mg/L)' },
]

const inputClass =
  'w-full border-2 border-ink/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand transition-colors'

export default function DataForm() {
  const today = todayWIB()
  const [form, setForm] = useState({ tanggal: today, area: 'WWTP 1', catatan: '' })
  const [status, setStatus] = useState(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const payload = {
      tanggal: form.tanggal,
      area: form.area,
      catatan: form.catatan || null,
      input_by: user.id,
    }

    FIELDS.forEach((f) => {
      const inletVal = form[`${f.key}_inlet`]
      const outletVal = form[`${f.key}_outlet`]
      payload[`${f.key}_inlet`] = inletVal ? Number(inletVal) : null
      payload[`${f.key}_outlet`] = outletVal ? Number(outletVal) : null
    })

    const { error } = await supabase
      .from('daily_water_quality')
      .upsert(payload, { onConflict: 'tanggal,area' })

    setSaving(false)

    if (error) {
      setStatus({ type: 'error', message: 'Gagal menyimpan data. Coba lagi.' })
      return
    }

    setStatus({ type: 'success', message: 'Data tersimpan.' })
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="tanggal">
            Tanggal
          </label>
          <input
            id="tanggal"
            type="date"
            required
            value={form.tanggal}
            onChange={(e) => update('tanggal', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="area">
            Area
          </label>
          <select id="area" value={form.area} onChange={(e) => update('area', e.target.value)} className={inputClass}>
            <option>WWTP 1</option>
            <option>WWTP 2</option>
          </select>
        </div>
      </div>

      <div className="border-2 border-ink/10 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-3 bg-cream text-xs font-semibold text-ink/50 px-4 py-2">
          <span>Parameter</span>
          <span>Inlet</span>
          <span>Outlet</span>
        </div>
        {FIELDS.map((f) => (
          <div key={f.key} className="grid grid-cols-3 px-4 py-2 border-t border-ink/5 items-center">
            <span className="text-sm text-ink/80">{f.label}</span>
            <input
              type="number"
              step="0.01"
              value={form[`${f.key}_inlet`] || ''}
              onChange={(e) => update(`${f.key}_inlet`, e.target.value)}
              className="border-2 border-ink/10 rounded-lg px-2 py-1.5 text-sm w-28 focus:outline-none focus:border-brand"
            />
            <input
              type="number"
              step="0.01"
              value={form[`${f.key}_outlet`] || ''}
              onChange={(e) => update(`${f.key}_outlet`, e.target.value)}
              className="border-2 border-ink/10 rounded-lg px-2 py-1.5 text-sm w-28 focus:outline-none focus:border-brand"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="catatan">
          Catatan (opsional)
        </label>
        <textarea
          id="catatan"
          rows={3}
          value={form.catatan}
          onChange={(e) => update('catatan', e.target.value)}
          className={inputClass}
          placeholder="Kendala, kejadian khusus, dll"
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
        {saving ? 'Menyimpan...' : 'Simpan data'}
      </button>
    </form>
  )
}
