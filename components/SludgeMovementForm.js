'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { todayWIB } from '@/lib/date'

const inputClass =
  'w-full border-2 border-ink/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand transition-colors'

export default function SludgeMovementForm() {
  const today = todayWIB()
  const [form, setForm] = useState({
    tanggal: today,
    area: 'P1',
    jenis: 'masuk',
    jumlah_kg: '',
    sumber: '',
    perusahaan_pengangkut: '',
    nopol_kendaraan: '',
    tujuan_penyerahan: '',
    bukti_dokumen: '',
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
    if (!form.jumlah_kg) return

    setSaving(true)
    setStatus(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const payload = {
      tanggal: form.tanggal,
      area: form.area,
      jenis: form.jenis,
      jumlah_kg: Number(form.jumlah_kg),
      keterangan: form.keterangan || null,
      input_by: user.id,
      sumber: form.jenis === 'masuk' ? form.sumber || null : null,
      perusahaan_pengangkut: form.jenis === 'keluar' ? form.perusahaan_pengangkut || null : null,
      nopol_kendaraan: form.jenis === 'keluar' ? form.nopol_kendaraan || null : null,
      tujuan_penyerahan: form.jenis === 'keluar' ? form.tujuan_penyerahan || null : null,
      bukti_dokumen: form.jenis === 'keluar' ? form.bukti_dokumen || null : null,
    }

    const { error } = await supabase.from('sludge_movements').insert(payload)

    setSaving(false)

    if (error) {
      setStatus({ type: 'error', message: 'Gagal menyimpan. Coba lagi.' })
      return
    }

    setStatus({ type: 'success', message: 'Transaksi tersimpan.' })
    setForm((f) => ({
      ...f,
      jumlah_kg: '',
      sumber: '',
      perusahaan_pengangkut: '',
      nopol_kendaraan: '',
      tujuan_penyerahan: '',
      bukti_dokumen: '',
      keterangan: '',
    }))
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 space-y-4">
      <div className="grid grid-cols-3 gap-3">
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
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="area">
            Plant
          </label>
          <select id="area" value={form.area} onChange={(e) => update('area', e.target.value)} className={inputClass}>
            <option value="P1">WWTP P1</option>
            <option value="P2">WWTP P2</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="jenis">
            Jenis
          </label>
          <select id="jenis" value={form.jenis} onChange={(e) => update('jenis', e.target.value)} className={inputClass}>
            <option value="masuk">Masuk</option>
            <option value="keluar">Keluar (diangkut)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="jumlah_kg">
          Jumlah (kg)
        </label>
        <input
          id="jumlah_kg"
          type="number"
          step="0.01"
          required
          value={form.jumlah_kg}
          onChange={(e) => update('jumlah_kg', e.target.value)}
          className={inputClass}
        />
      </div>

      {form.jenis === 'masuk' ? (
        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="sumber">
            Sumber limbah
          </label>
          <input
            id="sumber"
            type="text"
            value={form.sumber}
            onChange={(e) => update('sumber', e.target.value)}
            className={inputClass}
            placeholder="Grease oil trap, sludge, dll"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="perusahaan_pengangkut">
              Perusahaan pengangkut
            </label>
            <input
              id="perusahaan_pengangkut"
              type="text"
              value={form.perusahaan_pengangkut}
              onChange={(e) => update('perusahaan_pengangkut', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="nopol_kendaraan">
              Nopol kendaraan
            </label>
            <input
              id="nopol_kendaraan"
              type="text"
              value={form.nopol_kendaraan}
              onChange={(e) => update('nopol_kendaraan', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="tujuan_penyerahan">
              Tujuan penyerahan
            </label>
            <input
              id="tujuan_penyerahan"
              type="text"
              value={form.tujuan_penyerahan}
              onChange={(e) => update('tujuan_penyerahan', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="bukti_dokumen">
              Bukti nomor dokumen
            </label>
            <input
              id="bukti_dokumen"
              type="text"
              value={form.bukti_dokumen}
              onChange={(e) => update('bukti_dokumen', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      )}

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
