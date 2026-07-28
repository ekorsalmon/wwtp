const ACCENT_BG = {
  sunshine: 'bg-sunshine/40',
  mint: 'bg-mint/40',
  lavender: 'bg-lavender/40',
  sky: 'bg-sky/40',
}

function estimasiBadge(estimasiMinggu) {
  if (estimasiMinggu === null || estimasiMinggu === undefined) {
    return { text: 'Estimasi belum diset', className: 'bg-white text-ink/40' }
  }
  if (estimasiMinggu <= 2) {
    return { text: `Segera habis · ~${estimasiMinggu} mgg`, className: 'bg-coral text-white' }
  }
  if (estimasiMinggu <= 4) {
    return { text: `Mulai menipis · ~${estimasiMinggu} mgg`, className: 'bg-sunshine text-ink' }
  }
  return { text: `Aman · ~${estimasiMinggu} mgg`, className: 'bg-mint text-ink' }
}

export default function StockCard({ label, satuan, stok, estimasiMinggu, accent = 'sunshine' }) {
  const badge = estimasiBadge(estimasiMinggu)

  return (
    <div className={`rounded-3xl p-5 ${ACCENT_BG[accent] || ACCENT_BG.sunshine}`}>
      <p className="text-sm font-medium text-ink/60 mb-2">{label}</p>
      <p className="font-display text-2xl font-extrabold text-ink mb-3">
        {stok} <span className="text-sm font-medium text-ink/40">{satuan}</span>
      </p>
      <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${badge.className}`}>
        {badge.text}
      </span>
    </div>
  )
}
