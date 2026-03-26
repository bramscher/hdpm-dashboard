'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

interface SidebarProps {
  sections: { key: string; label: string }[]
  userEmail: string
  role: string
}

export default function Sidebar({ sections, userEmail, role }: SidebarProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-56 bg-white border-r border-gray-100 flex flex-col">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
            H
          </div>
          <span className="text-sm font-semibold text-gray-900">HDPM Dashboard</span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {sections.map(s => (
          <a
            key={s.key}
            href={`#${s.key}`}
            className={clsx(
              'block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition'
            )}
          >
            {s.label}
          </a>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 truncate" title={userEmail}>{userEmail}</p>
        <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">{role}</p>
        <button
          onClick={handleSignOut}
          className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
