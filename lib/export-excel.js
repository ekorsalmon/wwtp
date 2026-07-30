// Bikin & download file CSV dari array of objects.
// Nama kolom di file CSV = nama key di object (jadi siapin object-nya
// dengan key yang udah rapi/berlabel Indonesia SEBELUM dikasih ke sini).
//
// Sengaja PAKAI CSV, BUKAN library xlsx — library itu di beberapa
// browser (terutama yang dikunci kebijakan keamanan) bisa kena blokir
// Content Security Policy dan bikin seluruh interaktivitas halaman
// rusak. CSV gak butuh teknik semacam itu, dan tetap kebuka normal di
// Excel/Google Sheets.
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

  // \uFEFF (BOM) di depan supaya Excel baca huruf non-standar dengan benar
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

// Format tanggal simpel jadi "29 Jul 2026" — dipanggil di server (page.js)
// SEBELUM data dikirim ke ExportButton, bukan dikirim sebagai fungsi.
export function formatTanggalExport(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
