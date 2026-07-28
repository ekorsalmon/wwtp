import DataForm from '@/components/DataForm'

export default function InputPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink mb-1">Input data harian</h1>
      <p className="text-sm text-ink/50 mb-6">
        Isi hasil pengukuran inlet dan outlet untuk hari ini. Kalau tanggal dan area sama dipakai
        lagi, data lama akan diperbarui (bukan dobel).
      </p>
      <DataForm />
    </div>
  )
}
