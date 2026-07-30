// Minta server (route /api/export-xlsx) bikinin file .xlsx yang rapi
// (tabel, header tebal, border, lebar kolom otomatis), lalu download
// hasilnya di browser.
//
// Dulu di sini pakai library 'xlsx' langsung di browser, tapi itu bisa
// kena blokir Content Security Policy di beberapa environment dan
// bikin seluruh halaman rusak. Sekarang generate .xlsx-nya dipindah
// ke server (Node.js, lewat ExcelJS) — browser cuma nembak fetch() biasa
// dan download hasilnya, gak ada risiko CSP/eval sama sekali.
export async function exportToExcel(rows, filename, title) {
  if (!rows || rows.length === 0) return

  const res = await fetch('/api/export-xlsx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: rows, filename, title }),
  })

  if (!res.ok) {
    alert('Gagal membuat file Excel. Coba lagi.')
    return
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.xlsx`
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
