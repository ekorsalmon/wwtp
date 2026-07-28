'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const PARAMS = [
  { key: 'do', label: 'DO mg/L' },
  { key: 'ph', label: 'pH' },
  { key: 'tss', label: 'TSS' },
  { key: 'cod', label: 'COD' },
]

export default function TrendChart({ data }) {
  const [active, setActive] = useState('cod')
  const activeParam = PARAMS.find((p) => p.key === active)

  const formatted = data.map((d) => ({
    tanggal: new Date(d.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    outlet: d[`${active}_outlet`],
  }))

  return (
    <div className="bg-white rounded-3xl p-5">
      <div className="flex flex-wrap gap-1 mb-4">
        {PARAMS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setActive(p.key)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              active === p.key ? 'bg-brand text-white' : 'bg-cream text-ink/60 hover:bg-ink/10'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ECE8F5" vertical={false} />
            <XAxis dataKey="tanggal" tick={{ fontSize: 12, fill: '#8B8598' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#8B8598' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #ECE8F5' }} />
            <Line
              type="monotone"
              dataKey="outlet"
              name={`${activeParam?.label} outlet`}
              stroke="#5B4EE5"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
