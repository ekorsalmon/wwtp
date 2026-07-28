'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const RUTINITAS_OPTIONS = [
  { value: 'H', label: 'H - Harian' },
  { value: 'M', label: 'M - Mingguan' },
  { value: 'B', label: 'B - Bulanan' },
  { value: 'S', label: 'S - Sewaktu-waktu' },
  { value: 'T', label: 'T - Tahunan' },
]

const inputClass =
  'w-full border-2 border-ink/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand transition-colors'

export default function ActivityForm({ targetUserId }) {
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    tanggal: today,
    aktivitas: '',
    rutinitas: 'H',
    alat_kerja: '',
    rekan_kerja: 'WWTP TEAM',
    lokasi_kerja: 'WWTP 1',
    hasil: '',
    status: 'selesai',
  })
  const [status, setStatus] = useState(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.aktivitas.trim()) return

    setSaving(true)
    setStatus(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from('work_activities').insert({
      tanggal: form.tanggal,
      user_id: targetUserId,
      aktivitas: form.aktivitas.trim(),
      rutinitas: form.rutinitas || null,
      alat_kerja: form.alat_kerja || null,
      rekan_kerja: form.rekan_kerja || null,
      lokasi_kerja: form.lokasi_kerja || null,
      hasil: form.hasil || null,
      status: form.status,
      input_by: user.id,
    })

    setSaving(false)

    if (error) {
      setStatus({ type: 'error', message: 'Gagal menyimpan. Coba lagi.' })
      return
    }

    setStatus({ type: 'success', message: 'Aktivitas tersimpan.' })
    setForm((f) => ({ ...f, aktivitas: '', alat_kerja: '', hasil: '' }))
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="act-tanggal">
            Tanggal
          </label>
          <input
            id="act-tanggal"
            type="date"
            value={form.tanggal}
            onChange={(e) => update('tanggal', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="act-rutinitas">
            Rutinitas
          </label>
          <select
            id="act-rutinitas"
            value={form.rutinitas}
            onChange={(e) => update('rutinitas', e.target.value)}
            className={inputClass}
          >
            {RUTINITAS_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="act-aktivitas">
          Aktivitas
        </label>
        <textarea
          id="act-aktivitas"
          rows={2}
          required
          value={form.aktivitas}
          onChange={(e) => update('aktivitas', e.target.value)}
          className={inputClass}
          placeholder="Contoh: Pengecekan flowmeter STP dan WWTP"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="act-alat">
            Alat kerja
          </label>
          <input
            id="act-alat"
            type="text"
            value={form.alat_kerja}
            onChange={(e) => update('alat_kerja', e.target.value)}
            className={inputClass}
            placeholder="Alat tulis & form"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="act-rekan">
            Rekan kerja
          </label>
          <input
            id="act-rekan"
            type="text"
            value={form.rekan_kerja}
            onChange={(e) => update('rekan_kerja', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="act-lokasi">
            Lokasi kerja
          </label>
          <input
            id="act-lokasi"
            type="text"
            value={form.lokasi_kerja}
            onChange={(e) => update('lokasi_kerja', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="act-status">
            Status
          </label>
          <select id="act-status" value={form.status} onChange={(e) => update('status', e.target.value)} className={inputClass}>
            <option value="selesai">Selesai</option>
            <option value="proses">Masih proses</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="act-hasil">
          Hasil dari aktivitas (opsional)
        </label>
        <input
          id="act-hasil"
          type="text"
          value={form.hasil}
          onChange={(e) => update('hasil', e.target.value)}
          className={inputClass}
          placeholder="LAPORAN, SOP, dll"
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
        {saving ? 'Menyimpan...' : 'Simpan aktivitas'}
      </button>
    </form>
  )
}
