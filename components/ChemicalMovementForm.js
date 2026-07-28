'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ChemicalMovementForm({ chemicals }) {
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    chemical_key: chemicals[0]?.key || '',
    tanggal: today,
    jenis: 'keluar',
    jumlah: '',
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
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
      <div>
        <label className="block text-sm text-slate-600 mb-1" htmlFor="chemical_key">
          Bahan kimia
        </label>
        <select
          id="chemical_key"
          value={form.chemical_key}
          onChange={(e) => update('chemical_key', e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
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
          <label className="block text-sm text-slate-600 mb-1" htmlFor="tanggal">
            Tanggal
          </label>
          <input
            id="tanggal"
            type="date"
            value={form.tanggal}
            onChange={(e) => update('tanggal', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1" htmlFor="jenis">
            Jenis
          </label>
          <select
            id="jenis"
            value={form.jenis}
            onChange={(e) => update('jenis', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="keluar">Keluar (dipakai)</option>
            <option value="masuk">Masuk (kiriman baru)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-600 mb-1" htmlFor="jumlah">
          Jumlah (kg)
        </label>
        <input
          id="jumlah"
          type="number"
          step="0.01"
          required
          value={form.jumlah}
          onChange={(e) => update('jumlah', e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-600 mb-1" htmlFor="keterangan">
          Keterangan (opsional)
        </label>
        <input
          id="keterangan"
          type="text"
          value={form.keterangan}
          onChange={(e) => update('keterangan', e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          placeholder="Dipakai WWTP1, nomor dokumen, dll"
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
        {saving ? 'Menyimpan...' : 'Simpan transaksi'}
      </button>
    </form>
  )
}
