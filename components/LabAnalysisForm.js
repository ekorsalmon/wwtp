'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const UNITS = ['STP1', 'WWTP1', 'RWTP', 'STP2', 'WWTP2']
const TAHAP = ['Inlet', 'Equalisasi', 'Aerasi', 'R.A.S/Clarifier', 'Outlet']
const SHIFTS = [
  { value: '', label: 'Tidak ditentukan' },
  { value: '1', label: 'Shift 1' },
  { value: '2', label: 'Shift 2' },
  { value: '3', label: 'Shift 3' },
]

const inputClass =
  'w-full border-2 border-ink/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand transition-colors'

export default function LabAnalysisForm({ parameters }) {
  const today = new Date().toISOString().slice(0, 10)
  const [tanggal, setTanggal] = useState(today)
  const [unit, setUnit] = useState(UNITS[1])
  const [tahapProses, setTahapProses] = useState(TAHAP[4])
  const [shift, setShift] = useState('')
  const [values, setValues] = useState({})
  const [status, setStatus] = useState(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const rows = parameters
      .filter((p) => values[p.key] !== undefined && values[p.key] !== '')
      .map((p) => ({
        tanggal,
        unit,
        tahap_proses: tahapProses,
        parameter: p.key,
        nilai: Number(values[p.key]),
        shift: shift ? Number(shift) : null,
        input_by: user.id,
      }))

    if (rows.length === 0) {
      setSaving(false)
      setStatus({ type: 'error', message: 'Isi minimal satu parameter.' })
      return
    }

    const { error } = await supabase
      .from('lab_analysis')
      .upsert(rows, { onConflict: 'tanggal,unit,tahap_proses,parameter' })

    setSaving(false)

    if (error) {
      setStatus({ type: 'error', message: 'Gagal menyimpan. Coba lagi.' })
      return
    }

    setStatus({ type: 'success', message: `${rows.length} parameter tersimpan.` })
    setValues({})
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="tanggal">
            Tanggal
          </label>
          <input
            id="tanggal"
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="unit">
            Unit
          </label>
          <select id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} className={inputClass}>
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="tahap">
            Tahap proses
          </label>
          <select
            id="tahap"
            value={tahapProses}
            onChange={(e) => setTahapProses(e.target.value)}
            className={inputClass}
          >
            {TAHAP.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="shift">
            Shift
          </label>
          <select id="shift" value={shift} onChange={(e) => setShift(e.target.value)} className={inputClass}>
            {SHIFTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-2 border-ink/10 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-2 bg-cream text-xs font-semibold text-ink/50 px-4 py-2">
          <span>Parameter</span>
          <span>Nilai</span>
        </div>
        {parameters.map((p) => (
          <div key={p.key} className="grid grid-cols-2 px-4 py-2 border-t border-ink/5 items-center">
            <span className="text-sm text-ink/80">
              {p.label} {p.satuan ? <span className="text-ink/40">({p.satuan})</span> : null}
            </span>
            <input
              type="number"
              step="0.01"
              value={values[p.key] || ''}
              onChange={(e) => setValues((v) => ({ ...v, [p.key]: e.target.value }))}
              className="border-2 border-ink/10 rounded-lg px-2 py-1.5 text-sm w-28 focus:outline-none focus:border-brand"
            />
          </div>
        ))}
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
        {saving ? 'Menyimpan...' : 'Simpan hasil analisa'}
      </button>
    </form>
  )
}
