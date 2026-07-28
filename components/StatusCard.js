const ACCENT_BG = {
  sunshine: 'bg-sunshine/40',
  mint: 'bg-mint/40',
  lavender: 'bg-lavender/40',
  sky: 'bg-sky/40',
}

const STATUS_STYLES = {
  ok: { pill: 'bg-mint text-ink', label: 'Sesuai baku mutu' },
  violation: { pill: 'bg-coral text-white', label: 'Di luar baku mutu' },
  unknown: { pill: 'bg-white text-ink/50', label: 'Belum ada data' },
}

export default function StatusCard({ label, value, unit, status, accent = 'sunshine' }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.unknown
  const hasValue = value !== null && value !== undefined

  return (
    <div className={`rounded-3xl p-5 ${ACCENT_BG[accent] || ACCENT_BG.sunshine}`}>
      <p className="text-sm font-medium text-ink/60 mb-2">{label}</p>
      <p className="font-display text-3xl font-extrabold text-ink mb-3">
        {hasValue ? value : '—'}
        {unit && hasValue ? <span className="text-sm font-medium text-ink/40 ml-1">{unit}</span> : null}
      </p>
      <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${style.pill}`}>
        {style.label}
      </span>
    </div>
  )
}
