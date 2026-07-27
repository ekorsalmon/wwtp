'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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

export default function DataForm() {
  const today = new Date().toISOString().slice(0, 10)
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-600 mb-1" htmlFor="tanggal">
            Tanggal
          </label>
          <input
            id="tanggal"
            type="date"
            required
            value={form.tanggal}
            onChange={(e) => update('tanggal', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1" htmlFor="area">
            Area
          </label>
          <select
            id="area"
            value={form.area}
            onChange={(e) => update('area', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          >
            <option>WWTP 1</option>
            <option>WWTP 2</option>
          </select>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-3 bg-slate-50 text-xs font-medium text-slate-500 px-4 py-2">
          <span>Parameter</span>
          <span>Inlet</span>
          <span>Outlet</span>
        </div>
        {FIELDS.map((f) => (
          <div key={f.key} className="grid grid-cols-3 px-4 py-2 border-t border-slate-100 items-center">
            <span className="text-sm text-slate-700">{f.label}</span>
            <input
              type="number"
              step="0.01"
              value={form[`${f.key}_inlet`] || ''}
              onChange={(e) => update(`${f.key}_inlet`, e.target.value)}
              className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm w-28"
            />
            <input
              type="number"
              step="0.01"
              value={form[`${f.key}_outlet`] || ''}
              onChange={(e) => update(`${f.key}_outlet`, e.target.value)}
              className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm w-28"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm text-slate-600 mb-1" htmlFor="catatan">
          Catatan (opsional)
        </label>
        <textarea
          id="catatan"
          rows={3}
          value={form.catatan}
          onChange={(e) => update('catatan', e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          placeholder="Kendala, kejadian khusus, dll"
        />
      </div>

      {status && (
        <p className={`text-sm ${status.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-teal-800 disabled:opacity-50"
      >
        {saving ? 'Menyimpan...' : 'Simpan data'}
      </button>
    </form>
  )
}
