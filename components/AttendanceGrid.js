const SHIFT_CODE = { pagi: '1', malam: '3' }

export default function AttendanceGrid({ profiles, shiftMap, daysInMonth, sundays }) {
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="bg-white rounded-3xl p-4 overflow-x-auto">
      <table className="text-xs min-w-max">
        <thead>
          <tr>
            <th className="text-left px-2 py-1 font-semibold text-ink/50 sticky left-0 bg-white">Nama</th>
            {days.map((d) => (
              <th
                key={d}
                className={`text-center px-1.5 py-1 font-semibold w-6 ${
                  sundays.has(d) ? 'bg-coral/20 text-coral' : 'text-ink/50'
                }`}
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {profiles.map((p) => (
            <tr key={p.id} className="border-t border-ink/5">
              <td className="px-2 py-1.5 font-medium text-ink whitespace-nowrap sticky left-0 bg-white">
                {p.full_name}
              </td>
              {days.map((d) => {
                const shift = shiftMap[p.id]?.[d]
                return (
                  <td key={d} className={`text-center px-1.5 py-1.5 ${sundays.has(d) ? 'bg-coral/10' : ''}`}>
                    {shift ? (
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-ink ${
                          shift === 'pagi' ? 'bg-sunshine' : 'bg-lavender'
                        }`}
                      >
                        {SHIFT_CODE[shift]}
                      </span>
                    ) : (
                      <span className="text-ink/15">·</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-ink/50">
        <span className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold text-ink bg-sunshine">
            1
          </span>
          Shift Pagi
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold text-ink bg-lavender">
            3
          </span>
          Shift Malam
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-4 rounded bg-coral/20"></span>
          Libur/Minggu
        </span>
      </div>
    </div>
  )
}
