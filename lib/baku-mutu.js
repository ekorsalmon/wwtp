// Bandingkan satu nilai parameter terhadap baris baku_mutu yang cocok.
// Return: 'ok' | 'violation' | 'unknown'
export function evaluateStatus(parameterKey, value, standarList) {
  if (value === null || value === undefined || !standarList) return 'unknown'

  const row = standarList.find((s) => s.parameter === parameterKey)
  if (!row) return 'unknown'

  const { min, max } = row
  if (min !== null && min !== undefined && value < min) return 'violation'
  if (max !== null && max !== undefined && value > max) return 'violation'

  return 'ok'
}
