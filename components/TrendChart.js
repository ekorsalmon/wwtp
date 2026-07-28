'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function TrendChart({ data }) {
  const formatted = data.map((d) => ({
    tanggal: new Date(d.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    inlet: d.cod_inlet,
    outlet: d.cod_outlet,
  }))

  return (
    <div className="bg-white rounded-3xl p-5" style={{ height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ECE8F5" vertical={false} />
          <XAxis dataKey="tanggal" tick={{ fontSize: 12, fill: '#8B8598' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#8B8598' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #ECE8F5' }} />
          <Line type="monotone" dataKey="inlet" name="COD inlet" stroke="#C9BFFA" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="outlet" name="COD outlet" stroke="#5B4EE5" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
