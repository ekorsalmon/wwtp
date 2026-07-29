// Semua fungsi di sini konsisten pakai WIB (UTC+7), gak peduli
// timezone server/browser-nya jalan di mana. Lihat penjelasan di
// todayWIB() buat alasan kenapa ini penting.

export function wibNow() {
  return new Date(Date.now() + 7 * 60 * 60 * 1000)
}

// "Hari ini" versi WIB, format YYYY-MM-DD.
//
// Kenapa perlu ini: `new Date().toISOString().slice(0, 10)` selalu ngasih
// tanggal versi UTC, bukan versi lokal. Server (Vercel) biasanya jalan di
// UTC, jadi kalau dipakai langsung, "hari ini" versi server bisa beda satu
// hari sama "hari ini" yang dimaksud orang di Indonesia — terutama pas
// dini hari WIB (00:00-06:59), yang secara UTC masih tanggal kemarin.
export function todayWIB() {
  return wibNow().toISOString().slice(0, 10)
}

// Rentang bulan berjalan versi WIB — dipakai buat grid kehadiran bulanan.
export function monthRangeWIB() {
  const wib = wibNow()
  const year = wib.getUTCFullYear()
  const month = wib.getUTCMonth()
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const monthStart = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10)
  const monthEnd = new Date(Date.UTC(year, month, daysInMonth)).toISOString().slice(0, 10)
  return { year, month, daysInMonth, monthStart, monthEnd }
}
