// Bikin & download file CSV dari array of objects.
//
// Sengaja PAKAI CSV, BUKAN library xlsx — library itu di beberapa browser
// (terutama yang dikunci kebijakan keamanan, kayak browser kantor) bisa
// kena blokir Content Security Policy karena teknik yang dipakainya buat
// baca/tulis file. Kalau itu ke-blokir, efeknya bisa merembet bikin
// SELURUH interaktivitas halaman ikut rusak, bukan cuma tombol export-nya.
// CSV gak butuh teknik semacam itu sama sekali, dan tetap kebuka normal
// kalau di-double click / dibuka lewat Excel atau Google Sheets.
export function exportToExcel(rows, filename) {
  if (!rows || rows.length === 0) return

  const headers = Object.keys(rows[0])

  function escapeCell(value) {
    if (value === null || value === undefined) return ''
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const lines = [headers.join(','), ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(','))]

  // \uFEFF (BOM) di depan supaya Excel baca huruf non-standar (misal huruf ber-aksen) dengan benar
  const csvContent = '\uFEFF' + lines.join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
