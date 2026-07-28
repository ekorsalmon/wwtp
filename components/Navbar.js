const ROLE_LABEL = {
  operator: 'Operator',
  lab: 'Tim lab',
  atasan: 'Atasan',
}

const LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/input', label: 'Input data' },
  { href: '/analisa-lab', label: 'Analisa lab' },
  { href: '/stok-kimia', label: 'Stok kimia' },
]

export default function Navbar({ fullName, role }) {
  return (
    <header className="bg-cream">
      <div className="max-w-5xl mx-auto px-4 h-20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-6">
          <span className="font-display font-extrabold text-lg tracking-tight text-ink">
            WWTP <span className="text-brand">P1</span>
          </span>
          <nav className="flex items-center gap-1 bg-white rounded-full p-1 border-2 border-ink/10">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-ink/60 hover:text-ink px-4 py-1.5 rounded-full hover:bg-cream transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right leading-tight">
            <p className="text-sm font-semibold text-ink">{fullName}</p>
            <p className="text-xs text-ink/50">{ROLE_LABEL[role] || role}</p>
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm font-semibold text-ink/60 hover:text-coral bg-white border-2 border-ink/10 rounded-full px-4 py-1.5 transition-colors"
            >
              Keluar
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
