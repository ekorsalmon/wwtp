// Bikin & download file CSV dari array of objects, dengan header rapi.
//
// `columns` (opsional): array [{ key, label, format? }] buat nentuin
// kolom mana yang mau ditampilkan, urutannya, judulnya, dan cara
// format nilainya. Kalau gak dikasih, otomatis pakai semua field yang
// ada (kecuali field internal kayak id/input_by/created_at) dengan
// judul yang di-rapiin otomatis.
//
// Sengaja PAKAI CSV, BUKAN library xlsx — library itu di beberapa
// browser (terutama yang dikunci kebijakan keamanan) bisa kena blokir
// Content Security Policy dan bikin seluruh interaktivitas halaman
// rusak. CSV gak butuh teknik semacam itu, dan tetap kebuka normal di
// Excel/Google Sheets.
export function exportToExcel(rows, filename, columns) {
  if (!rows || rows.length === 0) return

  const cols = columns || autoColumns(rows[0])

  function escapeCell(value) {
    if (value === null || value === undefined) return ''
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const headerLine = cols.map((c) => escapeCell(c.label)).join(',')
  const dataLines = rows.map((row) =>
    cols.map((c) => escapeCell(c.format ? c.format(row[c.key], row) : row[c.key])).join(',')
  )

  // \uFEFF (BOM) di depan supaya Excel baca huruf non-standar dengan benar
  const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\r\n')
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

const DEFAULT_EXCLUDE = ['id', 'input_by', 'created_at']

function autoColumns(sampleRow) {
  return Object.keys(sampleRow)
    .filter((key) => !DEFAULT_EXCLUDE.includes(key) && typeof sampleRow[key] !== 'object')
    .map((key) => ({
      key,
      label: key
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
    }))
}

// Format tanggal simpel jadi "29 Jul 2026" — dipakai di banyak kolom export
export function formatTanggalExport(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
