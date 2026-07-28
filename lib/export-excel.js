import * as XLSX from 'xlsx'

// Ubah array of objects jadi file .xlsx dan langsung download di browser.
export function exportToExcel(rows, filename, sheetName = 'Data') {
  if (!rows || rows.length === 0) return

  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}
