// Tentukan tipe unit (STP/WWTP) dari nama unit, dipakai buat milih
// ambang baku mutu yang tepat (beberapa parameter beda batas antara
// STP dan WWTP).
export function unitTipeFor(unit) {
  if (!unit) return 'ALL'
  if (unit.startsWith('STP')) return 'STP'
  if (unit.startsWith('WWTP')) return 'WWTP'
  return 'ALL'
}

// Bandingkan satu nilai parameter terhadap baris baku_mutu yang cocok.
// Cari dulu yang spesifik ke tipe unit, kalau gak ada baru pakai 'ALL'.
// Return: 'ok' | 'violation' | 'unknown'
export function evaluateStatus(parameterKey, value, standarList, unitTipe = 'WWTP') {
  if (value === null || value === undefined || !standarList) return 'unknown'

  const row =
    standarList.find((s) => s.parameter === parameterKey && s.unit_tipe === unitTipe) ||
    standarList.find((s) => s.parameter === parameterKey && s.unit_tipe === 'ALL')

  if (!row) return 'unknown'

  const { min, max } = row
  if (min !== null && min !== undefined && value < min) return 'violation'
  if (max !== null && max !== undefined && value > max) return 'violation'

  return 'ok'
}
