'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function TrendChart({ data }) {
  const formatted = data.map((d) => ({
    tanggal: new Date(d.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    inlet: d.cod_inlet,
    outlet: d.cod_outlet,
  }))

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4" style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="tanggal" tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip />
          <Line type="monotone" dataKey="inlet" name="COD inlet" stroke="#94a3b8" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="outlet" name="COD outlet" stroke="#0f766e" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
