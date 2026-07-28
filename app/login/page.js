'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const inputClass =
  'w-full border-2 border-ink/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand transition-colors'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      setError('Email atau password salah.')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-lavender/50 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-sky/50 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-10 w-40 h-40 bg-sunshine/40 rounded-full blur-3xl hidden sm:block" />

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <p className="font-display font-extrabold text-3xl tracking-tight text-ink">
            WWTP <span className="text-brand">P1</span>
          </p>
          <p className="text-sm text-ink/50 mt-2">Sistem monitoring harian</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 space-y-4 shadow-sm">
          <div>
            <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="nama@perusahaan.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white text-sm font-semibold py-2.5 rounded-full hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        <p className="text-xs text-ink/40 text-center mt-6">
          Belum punya akun? Minta atasan buatkan lewat Supabase Dashboard.
        </p>
      </div>
    </div>
  )
}
