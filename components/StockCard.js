const ACCENT_BG = {
  sunshine: 'bg-sunshine/40',
  mint: 'bg-mint/40',
  lavender: 'bg-lavender/40',
  sky: 'bg-sky/40',
}

export default function StockCard({ label, unit, stok, stokMinimum, accent = 'sunshine' }) {
  const isLow = stokMinimum !== null && stokMinimum !== undefined && stok <= stokMinimum

  return (
    <div className={`rounded-3xl p-5 ${ACCENT_BG[accent] || ACCENT_BG.sunshine}`}>
      <p className="text-sm font-medium text-ink/60 mb-2">{label}</p>
      <p className="font-display text-2xl font-extrabold text-ink mb-3">
        {stok} <span className="text-sm font-medium text-ink/40">{unit}</span>
      </p>
      {isLow ? (
        <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-coral text-white">
          Stok menipis
        </span>
      ) : (
        <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-white text-ink/60">
          Stok aman
        </span>
      )}
    </div>
  )
}
