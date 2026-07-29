'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const ROLE_LABEL = {
  operator: 'Operator',
  lab: 'Tim lab',
  atasan: 'Atasan',
}

const WORKS_LINKS = [
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

const ALL_LINKS = [
  { href: '/dashboard', label: 'HOME' },
  { href: '/input', label: 'DATA' },
  { href: '/profile', label: 'Profile' },
  { href: '/kelola-user', label: 'Kelola User' },
  ...WORKS_LINKS,
]

export default function Navbar({ fullName, role }) {
  const [worksOpen, setWorksOpen] = useState(false)
  const [query, setQuery] = useState('')
  const worksRef = useRef(null)
  const searchRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(e) {
      if (worksRef.current && !worksRef.current.contains(e.target)) setWorksOpen(false)
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

  return (
    <header className="bg-cream relative z-20">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="font-display font-extrabold text-lg tracking-tight text-ink">
              WWTP <span className="text-brand">P1</span>
            </span>

            <nav className="flex items-center gap-1 bg-white rounded-full p-1 border-2 border-ink/10">
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

              <div className="relative" ref={worksRef}>
                <button
                  type="button"
                  onClick={() => setWorksOpen((v) => !v)}
                  className={`text-sm font-bold px-4 py-1.5 rounded-full transition-colors ${
                    worksOpen ? 'bg-brand text-white' : 'text-ink/70 hover:text-ink hover:bg-cream'
                  }`}
                >
                  WORKS
                </button>
                {worksOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl border-2 border-ink/10 p-2 flex flex-wrap gap-1.5 w-[420px] max-w-[80vw] shadow-lg">
                    {WORKS_LINKS.map((link) => (
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

              <a
                href="/profile"
                className="text-sm font-bold text-ink/70 hover:text-ink px-4 py-1.5 rounded-full hover:bg-cream transition-colors"
              >
                Profile
              </a>

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

          <div className="flex items-center gap-3">
            <div className="relative" ref={searchRef}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari halaman..."
                className="text-sm border-2 border-ink/10 rounded-full pl-4 pr-3 py-1.5 w-36 sm:w-48 focus:outline-none focus:border-brand transition-colors bg-white"
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
      </div>
    </header>
  )
}
