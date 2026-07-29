'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { todayWIB } from '@/lib/date'

const inputClass =
  'w-full border-2 border-ink/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand transition-colors'

function currentHour() {
  return new Date().getHours()
}

export default function HourlyReadingForm({ meters }) {
  const today = todayWIB()
  const [form, setForm] = useState({
    meter_key: meters[0]?.key || '',
    tanggal: today,
    jam: currentHour(),
    nilai: '',
  })
  const [status, setStatus] = useState(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const selectedMeter = meters.find((m) => m.key === form.meter_key)
  const isFlowmeter = selectedMeter?.jenis === 'flowmeter' || selectedMeter?.jenis === 'flowmeter_harian'
  const isDaily = selectedMeter?.jenis === 'flowmeter_harian'

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.meter_key || form.nilai === '') return

    setSaving(true)
    setStatus(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from('hourly_readings').upsert(
      {
        meter_key: form.meter_key,
        tanggal: form.tanggal,
        jam: isDaily ? 0 : Number(form.jam),
        nilai: Number(form.nilai),
        input_by: user.id,
      },
      { onConflict: 'tanggal,meter_key,jam' }
    )

    setSaving(false)

    if (error) {
      setStatus({ type: 'error', message: 'Gagal menyimpan. Coba lagi.' })
      return
    }

    setStatus({ type: 'success', message: 'Pembacaan tersimpan.' })
    setForm((f) => ({ ...f, nilai: '' }))
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="meter_key">
          Titik pembacaan
        </label>
        <select
          id="meter_key"
          value={form.meter_key}
          onChange={(e) => update('meter_key', e.target.value)}
          className={inputClass}
        >
          {meters.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className={isDaily ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-3 gap-3'}>
        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="tanggal">
            Tanggal
          </label>
          <input
            id="tanggal"
            type="date"
            value={form.tanggal}
            onChange={(e) => update('tanggal', e.target.value)}
            className={inputClass}
          />
        </div>
        {!isDaily && (
          <div>
            <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="jam">
              Jam
            </label>
            <select id="jam" value={form.jam} onChange={(e) => update('jam', e.target.value)} className={inputClass}>
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="nilai">
            {isFlowmeter ? 'Angka meteran' : 'Nilai SV30'}
          </label>
          <input
            id="nilai"
            type="number"
            step="0.01"
            required
            value={form.nilai}
            onChange={(e) => update('nilai', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <p className="text-xs text-ink/40">
        {isFlowmeter
          ? 'Isi angka kumulatif yang tertera di layar meteran saat ini — bukan selisihnya. Debit per jam dihitung otomatis oleh sistem.'
          : 'Isi hasil pengukuran pakai gelas ukur. Rata-rata harian dihitung otomatis oleh sistem.'}
      </p>

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
        {saving ? 'Menyimpan...' : 'Simpan pembacaan'}
      </button>
    </form>
  )
}
