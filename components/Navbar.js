const ROLE_LABEL = {
  operator: 'Operator',
  lab: 'Tim lab',
  atasan: 'Atasan',
}

export default function Navbar({ fullName, role }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-semibold text-teal-700">WWTP P1</span>
          <nav className="flex gap-5 text-sm">
            <a href="/dashboard" className="text-slate-600 hover:text-teal-700">
              Dashboard
            </a>
            <a href="/input" className="text-slate-600 hover:text-teal-700">
              Input data
            </a>
            <a href="/analisa-lab" className="text-slate-600 hover:text-teal-700">
              Analisa lab
            </a>
            <a href="/stok-kimia" className="text-slate-600 hover:text-teal-700">
              Stok kimia
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-right leading-tight">
            <p className="font-medium text-slate-800">{fullName}</p>
            <p className="text-xs text-slate-500">{ROLE_LABEL[role] || role}</p>
          </div>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-sm text-slate-500 hover:text-red-600">
              Keluar
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
