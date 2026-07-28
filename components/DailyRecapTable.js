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
  const [readings, setReadings] = useState({})
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!meterKey) return

    let active = true
    setLoading(true)

    supabase
      .from('hourly_readings')
      .select('jam, nilai')
      .eq('tanggal', tanggal)
      .eq('meter_key', meterKey)
      .then(({ data }) => {
        if (!active) return
        const map = {}
        ;(data || []).forEach((r) => {
          map[r.jam] = r.nilai
        })
        setReadings(map)
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [tanggal, meterKey])

  const meter = meters.find((m) => m.key === meterKey)

  return (
    <div className="bg-white rounded-3xl p-5">
      <div className="flex flex-wrap items-end gap-3 mb-4">
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
                {HOURS.map((h) => (
                  <td key={h} className="text-center px-2 py-2 border-t border-ink/5">
                    {readings[h] !== undefined ? (
                      <span className="font-semibold text-ink">{readings[h]}</span>
                    ) : (
                      <span className="text-ink/20">—</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {meter && <p className="text-xs text-ink/40 mt-3">Satuan: {meter.unit}</p>}
    </div>
  )
}
