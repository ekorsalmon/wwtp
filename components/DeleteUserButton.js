'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteUserButton({ userId, fullName }) {
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    const confirmed = confirm(
      `Hapus akun ${fullName}? Akun ini gak akan bisa login lagi. Data yang pernah diinput akun ini TETAP TERSIMPAN (cuma keterangan "siapa yang input" jadi kosong). Tindakan ini gak bisa dibatalkan.`
    )
    if (!confirmed) return

    setDeleting(true)

    const res = await fetch('/api/users/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })

    const result = await res.json()
    setDeleting(false)

    if (!res.ok) {
      alert(result.error || 'Gagal menghapus akun.')
      return
    }

    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="text-xs font-semibold text-ink/30 hover:text-coral transition-colors disabled:opacity-40"
    >
      {deleting ? '...' : 'Hapus akun'}
    </button>
  )
}
