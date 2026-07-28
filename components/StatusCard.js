const STYLES = {
  ok: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Sesuai baku mutu' },
  violation: { bg: 'bg-red-50', text: 'text-red-700', label: 'Di luar baku mutu' },
  unknown: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Belum ada data' },
}

export default function StatusCard({ label, value, unit, status }) {
  const style = STYLES[status] || STYLES.unknown
  const hasValue = value !== null && value !== undefined

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-slate-900 mb-2">
        {hasValue ? value : '—'}
        {unit && hasValue ? <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span> : null}
      </p>
      <span className={`inline-block text-xs px-2 py-1 rounded-md ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    </div>
  )
}
