const ROLE_LABEL = {
  operator: 'Operator',
  lab: 'Tim lab',
  atasan: 'Atasan',
}

const PRIMARY_LINKS = [
  { href: '/dashboard', label: 'HOME' },
  { href: '/input', label: 'DATA' },
  { href: '/profile', label: 'Profile' },
]

const SECONDARY_LINKS = [
  { href: '/curah-hujan', label: 'Curah Hujan' },
  { href: '/sludge', label: 'Data Sludge' },
  { href: '/fm-out-stp', label: 'FM Out STP' },
  { href: '/fm-out-wwtp', label: 'FM Out WWTP' },
  { href: '/fm-in-rwtp', label: 'FM In RWTP' },
  { href: '/fm-out-rwtp', label: 'FM Out RWTP' },
  { href: '/sv30-stp', label: 'SV30 STP' },
  { href: '/sv30-wwtp', label: 'SV30 WWTP' },
  { href: '/analisa-lab', label: 'Analisa' },
  { href: '/neraca', label: 'Logbook' },
  { href: '/abt', label: 'ABT' },
  { href: '/f1-f4', label: 'F1 & F4' },
  { href: '/stok-kimia', label: 'Stok Kimia' },
]

export default function Navbar({ fullName, role }) {
  return (
    <header className="bg-cream">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-4">
            <span className="font-display font-extrabold text-lg tracking-tight text-ink">
              WWTP <span className="text-brand">P1</span>
            </span>
            <nav className="flex items-center gap-1 bg-white rounded-full p-1 border-2 border-ink/10">
              {PRIMARY_LINKS.map((link) => (
                
                  key={link.href}
                  href={link.href}
                  className="text-sm font-bold text-ink/70 hover:text-ink px-4 py-1.5 rounded-full hover:bg-cream transition-colors"
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

        <nav className="flex flex-wrap gap-1.5">
          {SECONDARY_LINKS.map((link) => (
            
              key={link.href}
              href={link.href}
              className="text-xs font-semibold text-ink/60 bg-white border-2 border-ink/10 px-3 py-1.5 rounded-lg hover:bg-brand hover:text-white hover:border-brand transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
