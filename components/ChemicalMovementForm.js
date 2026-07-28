'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const UNIT_OPTIONS = ['WWTP1', 'WWTP2', 'RWTP', 'STP1', 'STP2', 'Lainnya']

const inputClass =
  'w-full border-2 border-ink/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand transition-colors'

export default function ChemicalMovementForm({ chemicals }) {
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    chemical_key: chemicals[0]?.key || '',
    tanggal: today,
    jenis: 'keluar',
    jumlah: '',
    unit: 'WWTP1',
    keterangan: '',
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
    if (!form.chemical_key || !form.jumlah) return

    setSaving(true)
    setStatus(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from('chemical_movements').insert({
      chemical_key: form.chemical_key,
      tanggal: form.tanggal,
      jenis: form.jenis,
      jumlah: Number(form.jumlah),
      unit: form.jenis === 'keluar' ? form.unit : null,
      keterangan: form.keterangan || null,
      input_by: user.id,
    })

    setSaving(false)

    if (error) {
      setStatus({ type: 'error', message: 'Gagal menyimpan. Coba lagi.' })
      return
    }

    setStatus({ type: 'success', message: 'Transaksi tersimpan.' })
    setForm((f) => ({ ...f, jumlah: '', keterangan: '' }))
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="chemical_key">
          Bahan kimia
        </label>
        <select
          id="chemical_key"
          value={form.chemical_key}
          onChange={(e) => update('chemical_key', e.target.value)}
          className={inputClass}
        >
          {chemicals.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
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
        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="jenis">
            Jenis
          </label>
          <select id="jenis" value={form.jenis} onChange={(e) => update('jenis', e.target.value)} className={inputClass}>
            <option value="keluar">Keluar (dipakai)</option>
            <option value="masuk">Masuk (kiriman baru)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="jumlah">
            Jumlah
          </label>
          <input
            id="jumlah"
            type="number"
            step="0.01"
            required
            value={form.jumlah}
            onChange={(e) => update('jumlah', e.target.value)}
            className={inputClass}
          />
        </div>
        {form.jenis === 'keluar' && (
          <div>
            <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="unit">
              Dipakai di unit
            </label>
            <select id="unit" value={form.unit} onChange={(e) => update('unit', e.target.value)} className={inputClass}>
              {UNIT_OPTIONS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="keterangan">
          Keterangan (opsional)
        </label>
        <input
          id="keterangan"
          type="text"
          value={form.keterangan}
          onChange={(e) => update('keterangan', e.target.value)}
          className={inputClass}
          placeholder="Nomor dokumen, catatan lain, dll"
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
        {saving ? 'Menyimpan...' : 'Simpan transaksi'}
      </button>
    </form>
  )
}
