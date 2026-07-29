'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RoleSelect({ userId, currentRole, disabled }) {
  const [role, setRole] = useState(currentRole)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleChange(e) {
    const newRole = e.target.value
    const previous = role
    setRole(newRole)
    setSaving(true)

    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)

    setSaving(false)

    if (error) {
      alert('Gagal mengubah role.')
      setRole(previous)
      return
    }

    router.refresh()
  }

  return (
    <select
      value={role}
      onChange={handleChange}
      disabled={saving || disabled}
      className="text-xs font-semibold border-2 border-ink/10 rounded-lg px-2 py-1.5 bg-white disabled:opacity-50"
    >
      <option value="operator">Operator</option>
      <option value="lab">Tim lab</option>
      <option value="atasan">Atasan</option>
    </select>
  )
}
