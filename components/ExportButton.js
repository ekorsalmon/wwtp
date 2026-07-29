'use client'

import { exportToExcel } from '@/lib/export-excel'

export default function ExportButton({ data, filename, columns }) {
  function handleExport() {
    exportToExcel(data, filename, columns)
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={!data || data.length === 0}
      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border-2 border-ink/10 text-ink/60 hover:border-brand hover:text-brand transition-colors disabled:opacity-40"
    >
      Export Excel
    </button>
  )
}
