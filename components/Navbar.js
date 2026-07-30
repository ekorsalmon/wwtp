'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const ROLE_LABEL = {
  operator: 'Operator',
  lab: 'Tim lab',
  atasan: 'Atasan',
}

// WORKS 1 = semua yang khusus WWTP Plant 1, ditambah fitur yang memang
// satu buat seluruh site (gak ada versi P2-nya).
const WORKS1_LINKS = [
  { href: '/fm-out-stp-p1', label: 'FM Out STP (P1)' },
  { href: '/fm-out-wwtp-p1', label: 'FM Out WWTP (P1)' },
  { href: '/sv30-stp-p1', label: 'SV30 STP (P1)' },
  { href: '/sv30-wwtp-p1', label: 'SV30 WWTP (P1)' },
  { href: '/sludge-p1', label: 'Data Sludge (P1)' },
  { href: '/curah-hujan', label: 'Curah Hujan' },
  { href: '/analisa-lab', label: 'Analisa' },
  { href: '/neraca', label: 'Logbook' },
  { href: '/fm-in-rwtp', label: 'FM In RWTP' },
  { href: '/fm-out-rwtp', label: 'FM Out RWTP' },
  { href: '/abt', label: 'ABT' },
  { href: '/f1-f4', label: 'F1 & F4' },
  { href: '/stok-kimia', label: 'Stok Kimia' },
]

// WORKS 2 = khusus WWTP Plant 2 aja.
const WORKS2_LINKS = [
  { href: '/fm-out-stp-p2', label: 'FM Out STP (P2)' },
  { href: '/fm-out-wwtp-p2', label: 'FM Out WWTP (P2)' },
  { href: '/sv30-stp-p2', label: 'SV30 STP (P2)' },
  { href: '/sv30-wwtp-p2', label: 'SV30 WWTP (P2)' },
  { href: '/sludge-p2', label: 'Data Sludge (P2)' },
]

const ALL_LINKS = [
  { href: '/dashboard', label: 'HOME' },
  { href: '/input', label: 'DATA' },
  { href: '/profile', label: 'Profile' },
  { href: '/kelola-user', label: 'Kelola User' },
  ...WORKS1_LINKS,
  ...WORKS2_LINKS,
]

export default function Navbar({ fullName, role }) {
  const [works1Open, setWorks1Open] = useState(false)
  const [works2Open, setWorks2Open] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const works1Ref = useRef(null)
  const works2Ref = useRef(null)
  const menuRef = useRef(null)
  const searchRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(e) {
      if (works1Ref.current && !works1Ref.current.contains(e.target)) setWorks1Open(false)
      if (works2Ref.current && !works2Ref.current.contains(e.target)) setWorks2Open(false)
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target)) setQuery('')
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const matches = query.trim()
    ? ALL_LINKS.filter((l) => l.label.toLowerCase().includes(query.trim().toLowerCase()))
    : []

  function goTo(href) {
    setQuery('')
    router.push(href)
  }

  const initial = (fullName || '?').trim().charAt(0).toUpperCase()

  return (
    <header className="bg-cream relative z-20">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 min-w-0">
          <img src="/logo.png" alt="Pratama" className="h-8 w-auto shrink-0" />

          <nav className="flex items-center gap-1 bg-white rounded-full p-1 border-2 border-ink/10 shrink-0">
            <a
              href="/dashboard"
              className="text-sm font-bold text-ink/70 hover:text-ink px-4 py-1.5 rounded-full hover:bg-cream transition-colors"
            >
              HOME
            </a>
            <a
              href="/input"
              className="text-sm font-bold text-ink/70 hover:text-ink px-4 py-1.5 rounded-full hover:bg-cream transition-colors"
            >
              DATA
            </a>

            <div className="relative" ref={works1Ref}>
              <button
                type="button"
                onClick={() => setWorks1Open((v) => !v)}
                className={`text-sm font-bold px-4 py-1.5 rounded-full transition-colors ${
                  works1Open ? 'bg-brand text-white' : 'text-ink/70 hover:text-ink hover:bg-cream'
                }`}
              >
                WORKS 1
              </button>
              {works1Open && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl border-2 border-ink/10 p-2 flex flex-wrap gap-1.5 w-[420px] max-w-[80vw] shadow-lg">
                  {WORKS1_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-cream text-ink/60 hover:bg-brand hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" ref={works2Ref}>
              <button
                type="button"
                onClick={() => setWorks2Open((v) => !v)}
                className={`text-sm font-bold px-4 py-1.5 rounded-full transition-colors ${
                  works2Open ? 'bg-brand text-white' : 'text-ink/70 hover:text-ink hover:bg-cream'
                }`}
              >
                WORKS 2
              </button>
              {works2Open && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl border-2 border-ink/10 p-2 flex flex-wrap gap-1.5 w-[420px] max-w-[80vw] shadow-lg">
                  {WORKS2_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-cream text-ink/60 hover:bg-brand hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {role === 'atasan' && (
              <a
                href="/kelola-user"
                className="text-sm font-bold text-ink/70 hover:text-ink px-4 py-1.5 rounded-full hover:bg-cream transition-colors"
              >
                Kelola User
              </a>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative" ref={searchRef}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari halaman..."
              className="text-sm border-2 border-ink/10 rounded-full pl-4 pr-3 py-1.5 w-32 sm:w-44 focus:outline-none focus:border-brand transition-colors bg-white"
            />
            {matches.length > 0 && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl border-2 border-ink/10 p-2 w-56 shadow-lg">
                {matches.map((m) => (
                  <button
                    key={m.href}
                    type="button"
                    onClick={() => goTo(m.href)}
                    className="block w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-cream text-ink/70"
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="w-9 h-9 rounded-full bg-brand text-white font-display font-bold text-sm flex items-center justify-center hover:bg-brand-dark transition-colors"
              title={fullName}
            >
              {initial}
            </button>

            {menuOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl border-2 border-ink/10 p-2 w-52 shadow-lg">
                <div className="px-3 py-2 border-b border-ink/5 mb-1">
                  <p className="text-sm font-semibold text-ink truncate">{fullName}</p>
                  <p className="text-xs text-ink/50">{ROLE_LABEL[role] || role}</p>
                </div>
                <a
                  href="/profile"
                  className="block text-sm px-3 py-2 rounded-lg hover:bg-cream text-ink/70"
                >
                  Profile & aktivitas
                </a>
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-cream text-coral font-medium"
                  >
                    Keluar
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
