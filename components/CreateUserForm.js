'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const inputClass =
  'w-full border-2 border-ink/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand transition-colors'

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let pass = ''
  for (let i = 0; i < 8; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)]
  }
  return pass
}

export default function CreateUserForm() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'operator' })
  const [status, setStatus] = useState(null)
  const [created, setCreated] = useState(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    setCreated(null)

    const res = await fetch('/api/users/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const result = await res.json()
    setSaving(false)

    if (!res.ok) {
      setStatus({ type: 'error', message: result.error || 'Gagal membuat akun.' })
      return
    }

    setCreated({ email: form.email, password: form.password, full_name: form.full_name })
    setForm({ full_name: '', email: '', password: '', role: 'operator' })
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="full_name">
            Nama lengkap
          </label>
          <input
            id="full_name"
            type="text"
            required
            value={form.full_name}
            onChange={(e) => update('full_name', e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className={inputClass}
            placeholder="nama@perusahaan.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="password">
            Password
          </label>
          <div className="flex gap-2">
            <input
              id="password"
              type="text"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className={inputClass}
              placeholder="Minimal 6 karakter"
            />
            <button
              type="button"
              onClick={() => update('password', generatePassword())}
              className="shrink-0 text-xs font-semibold px-3 py-2 rounded-xl bg-cream text-ink/60 hover:bg-ink/10 transition-colors"
            >
              Buatkan
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink/70 mb-1" htmlFor="role">
            Role
          </label>
          <select id="role" value={form.role} onChange={(e) => update('role', e.target.value)} className={inputClass}>
            <option value="operator">Operator</option>
            <option value="lab">Tim lab</option>
            <option value="atasan">Atasan</option>
          </select>
        </div>

        {status && <p className="text-sm font-medium text-red-600">{status.message}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-brand text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-brand-dark transition-colors disabled:opacity-50"
        >
          {saving ? 'Membuat...' : 'Buat akun'}
        </button>
      </form>

      {created && (
        <div className="rounded-3xl p-5 bg-mint/40">
          <p className="text-sm font-semibold text-ink mb-2">
            Akun {created.full_name} berhasil dibuat. Catat/kirim ini sekarang — gak akan ketampil lagi:
          </p>
          <p className="text-sm text-ink/80">
            Email: <span className="font-mono font-semibold">{created.email}</span>
          </p>
          <p className="text-sm text-ink/80">
            Password: <span className="font-mono font-semibold">{created.password}</span>
          </p>
        </div>
      )}
    </div>
  )
}
