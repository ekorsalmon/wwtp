export default function StockCard({ label, unit, stok, stokMinimum }) {
  const isLow = stokMinimum !== null && stokMinimum !== undefined && stok <= stokMinimum

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-slate-900 mb-2">
        {stok} <span className="text-sm font-normal text-slate-400">{unit}</span>
      </p>
      {isLow ? (
        <span className="inline-block text-xs px-2 py-1 rounded-md bg-amber-50 text-amber-700">
          Stok menipis
        </span>
      ) : (
        <span className="inline-block text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-500">
          Stok aman
        </span>
      )}
    </div>
  )
}
