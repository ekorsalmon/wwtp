'use client'

import { useState } from 'react'
import { exportToExcel } from '@/lib/export-excel'

export default function ExportButton({ data, filename, title }) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    await exportToExcel(data, filename, title)
    setLoading(false)
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={!data || data.length === 0 || loading}
      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border-2 border-ink/10 text-ink/60 hover:border-brand hover:text-brand transition-colors disabled:opacity-40"
    >
      {loading ? 'Membuat file...' : 'Export Excel'}
    </button>
  )
}
