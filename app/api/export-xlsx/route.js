import ExcelJS from 'exceljs'

// PENTING: route ini jalan di Node.js runtime di server Vercel, BUKAN
// di browser. ExcelJS gak pernah masuk ke bundle JS yang dikirim ke
// browser, jadi gak ada risiko kena blokir Content Security Policy
// kayak yang dulu bikin library 'xlsx' harus dicabut.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BRAND = 'FF5B4EE5' // ungu brand Pratama (ARGB)
const INK = 'FF211B2E'
const CREAM = 'FFFBF7EE'
const WHITE = 'FFFFFFFF'
const BORDER_COLOR = 'FFE2DFEC'

// Kamus istilah WWTP yang huruf besarnya harus dipertahankan pas judul
// di-generate otomatis dari nama file (misal "data-harian-wwtp" -> "Data
// Harian WWTP", bukan "Data Harian Wwtp").
const ACRONYMS = new Set([
  'wwtp', 'stp', 'rwtp', 'sv30', 'fm', 'abt', 'p1', 'p2', 'f1', 'f4',
  'pac', 'naoh', 'dca', 'b3', 'do', 'ph', 'tss', 'cod', 'ras', 'es',
])

function titleFromFilename(filename) {
  return filename
    .split('-')
    .map((word) => (ACRONYMS.has(word.toLowerCase()) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ')
}

function isNumericColumn(rows, key) {
  const values = rows.map((r) => r[key]).filter((v) => v !== null && v !== undefined && v !== '')
  if (values.length === 0) return false
  return values.every((v) => typeof v === 'number')
}

// Lebar kolom otomatis, dihitung dari panjang konten terpanjang di
// kolom itu (header atau isi), dibatasi min 10 dan max 42 karakter.
function computeColumnWidth(header, rows, key) {
  let max = String(header).length
  for (const row of rows) {
    const v = row[key]
    if (v === null || v === undefined) continue
    const len = String(v).length
    if (len > max) max = len
  }
  return Math.min(Math.max(max + 3, 10), 42)
}

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return new Response('Body tidak valid.', { status: 400 })
  }

  const { data, filename, title } = body || {}
  const rows = Array.isArray(data) ? data : []
  const safeFilename = (filename || 'export').replace(/[^a-z0-9-_]/gi, '-')
  const sheetTitle = title || titleFromFilename(safeFilename)

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Pratama WWTP Monitoring'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet(sheetTitle.slice(0, 31) || 'Data', {
    views: [{ state: 'frozen', ySplit: 4 }],
  })

  if (rows.length === 0) {
    sheet.getCell('A1').value = 'Tidak ada data untuk diekspor.'
    sheet.getColumn(1).width = 40
    const buffer = await workbook.xlsx.writeBuffer()
    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${safeFilename}.xlsx"`,
      },
    })
  }

  const headers = Object.keys(rows[0])
  const colCount = headers.length

  // --- Baris judul (merged) ---
  sheet.mergeCells(1, 1, 1, colCount)
  const titleCell = sheet.getCell(1, 1)
  titleCell.value = sheetTitle
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: INK } }
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' }
  sheet.getRow(1).height = 26

  // --- Baris subjudul: tanggal export (merged) ---
  sheet.mergeCells(2, 1, 2, colCount)
  const subCell = sheet.getCell(2, 1)
  const exportedAt = new Date(Date.now() + 7 * 60 * 60 * 1000)
  const tanggalExport = exportedAt.toISOString().slice(0, 10).split('-').reverse().join('/')
  const jamExport = exportedAt.toISOString().slice(11, 16)
  subCell.value = `Diekspor ${tanggalExport} ${jamExport} WIB · ${rows.length} baris data`
  subCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF6B6478' } }
  sheet.getRow(2).height = 16

  // baris 3 dikosongin sebagai spacer visual
  sheet.getRow(3).height = 6

  // --- Baris header tabel (baris 4) ---
  const headerRowIndex = 4
  const headerRow = sheet.getRow(headerRowIndex)
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1)
    cell.value = h
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: WHITE } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND } }
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    cell.border = {
      top: { style: 'thin', color: { argb: BORDER_COLOR } },
      left: { style: 'thin', color: { argb: BORDER_COLOR } },
      bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
      right: { style: 'thin', color: { argb: BORDER_COLOR } },
    }
  })
  headerRow.height = 22

  // --- Kolom: lebar otomatis + deteksi kolom angka ---
  const numericFlags = headers.map((h) => isNumericColumn(rows, h))
  headers.forEach((h, i) => {
    sheet.getColumn(i + 1).width = computeColumnWidth(h, rows, h)
  })

  // --- Baris data ---
  rows.forEach((row, rIdx) => {
    const excelRow = sheet.getRow(headerRowIndex + 1 + rIdx)
    const isBanded = rIdx % 2 === 1
    headers.forEach((h, cIdx) => {
      const cell = excelRow.getCell(cIdx + 1)
      const value = row[h]
      cell.value = value === null || value === undefined ? '' : value
      cell.font = { name: 'Calibri', size: 10.5, color: { argb: INK } }
      cell.alignment = {
        vertical: 'middle',
        horizontal: numericFlags[cIdx] ? 'right' : 'left',
        wrapText: false,
      }
      if (numericFlags[cIdx] && typeof value === 'number') {
        cell.numFmt = Number.isInteger(value) ? '#,##0' : '#,##0.00'
      }
      cell.border = {
        top: { style: 'thin', color: { argb: BORDER_COLOR } },
        left: { style: 'thin', color: { argb: BORDER_COLOR } },
        bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
        right: { style: 'thin', color: { argb: BORDER_COLOR } },
      }
      if (isBanded) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CREAM } }
      }
    })
  })

  // --- Autofilter di baris header ---
  sheet.autoFilter = {
    from: { row: headerRowIndex, column: 1 },
    to: { row: headerRowIndex, column: colCount },
  }

  const buffer = await workbook.xlsx.writeBuffer()

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${safeFilename}.xlsx"`,
    },
  })
}
