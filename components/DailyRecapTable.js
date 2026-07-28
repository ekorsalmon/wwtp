'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const inputClass =
  'border-2 border-ink/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand transition-colors'

const HOURS = Array.from({ length: 24 }, (_, h) => h)

export default function DailyRecapTable({ meters }) {
  const today = new Date().toISOString().slice(0, 10)
  const [tanggal, setTanggal] = useState(today)
  const [meterKey, setMeterKey] = useState(meters[0]?.key || '')
  const [hourRows, setHourRows] = useState({})
  const [dailyRows, setDailyRows] = useState([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const meter = meters.find((m) => m.key === meterKey)
  const isDaily = meter?.jenis === 'flowmeter_harian'
  const isFlowmeter = meter?.jenis === 'flowmeter' || isDaily

  useEffect(() => {
    if (!meterKey) return

    let active = true
    setLoading(true)

    if (isDaily) {
      // Titik harian: tampilkan daftar 14 hari terakhir, bukan grid per jam
      supabase
        .from('hourly_readings_detail')
        .select('tanggal, nilai, debit')
        .eq('meter_key', meterKey)
        .order('tanggal', { ascending: false })
        .limit(14)
        .then(({ data }) => {
          if (!active) return
          setDailyRows(data || [])
          setLoading(false)
        })
    } else {
      supabase
        .from('hourly_readings_detail')
        .select('jam, nilai, debit')
        .eq('tanggal', tanggal)
        .eq('meter_key', meterKey)
        .then(({ data }) => {
          if (!active) return
          const map = {}
          ;(data || []).forEach((r) => {
            map[r.jam] = r
          })
          setHourRows(map)
          setLoading(false)
        })
    }

    return () => {
      active = false
    }
  }, [tanggal, meterKey, isDaily])

  const filledValues = HOURS.map((h) => hourRows[h]).filter(Boolean)
  const total = isFlowmeter && !isDaily ? filledValues.reduce((sum, r) => sum + (r.debit ?? 0), 0) : null
  const average =
    !isFlowmeter && filledValues.length > 0
      ? (filledValues.reduce((sum, r) => sum + Number(r.nilai || 0), 0) / filledValues.length).toFixed(2)
      : null

  return (
    <div className="bg-white rounded-3xl p-5">
      <div className="flex flex-wrap items-end gap-3 mb-4">
        {!isDaily && (
          <div>
            <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="recap-tanggal">
              Tanggal
            </label>
            <input
              id="recap-tanggal"
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className={inputClass}
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="recap-meter">
            Titik pembacaan
          </label>
          <select
            id="recap-meter"
            value={meterKey}
            onChange={(e) => setMeterKey(e.target.value)}
            className={inputClass}
          >
            {meters.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-ink/40">Memuat...</p>
      ) : isDaily ? (
        <div className="divide-y divide-ink/5">
          {dailyRows.length === 0 && <p className="text-sm text-ink/40">Belum ada pembacaan.</p>}
          {dailyRows.map((r) => (
            <div key={r.tanggal} className="flex items-center justify-between py-2 text-sm">
              <span className="text-ink/70">
                {new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className="font-semibold text-ink">
                {r.debit !== null ? r.debit : '—'} <span className="text-ink/40 font-normal">{meter?.unit}</span>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="text-sm min-w-max">
            <thead>
              <tr>
                {HOURS.map((h) => (
                  <th key={h} className="text-center px-2 py-1 text-xs font-semibold text-ink/50">
                    {String(h).padStart(2, '0')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {HOURS.map((h) => {
                  const r = hourRows[h]
                  const shown = r ? (isFlowmeter ? r.debit : r.nilai) : null
                  return (
                    <td key={h} className="text-center px-2 py-2 border-t border-ink/5">
                      {shown !== null && shown !== undefined ? (
                        <span className="font-semibold text-ink">{shown}</span>
                      ) : (
                        <span className="text-ink/20">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        {meter && <p className="text-xs text-ink/40">Satuan: {meter.unit}</p>}
        {total !== null && (
          <p className="text-sm font-semibold text-ink">
            Total hari ini: {total.toFixed(2)} {meter.unit}
          </p>
        )}
        {average !== null && (
          <p className="text-sm font-semibold text-ink">
            Rata-rata: {average} {meter.unit}
          </p>
        )}
      </div>
    </div>
  )
}
