// Urutan warna aksen yang dipakai bergantian di kartu data (KPI, stok, dst)
// supaya tiap parameter gampang dibedain sekilas.
export const ACCENT_CYCLE = ['sunshine', 'mint', 'lavender', 'sky']

export function accentAt(index) {
  return ACCENT_CYCLE[index % ACCENT_CYCLE.length]
}
