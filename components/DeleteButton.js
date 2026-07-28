'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DeleteButton({ table, id }) {
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    if (!confirm('Hapus data ini? Tindakan ini tidak bisa dibatalkan.')) return

    setDeleting(true)
    const { error } = await supabase.from(table).delete().eq('id', id)
    setDeleting(false)

    if (error) {
      alert('Gagal menghapus data.')
      return
    }

    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      title="Hapus"
      className="text-xs font-semibold text-ink/30 hover:text-coral transition-colors disabled:opacity-40 shrink-0"
    >
      {deleting ? '...' : 'Hapus'}
    </button>
  )
}
