'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import clsx from 'clsx'

interface SidebarProps {
  sections: { key: string; label: string }[]
  userEmail: string
  role: string
  isOpen: boolean
  onClose: () => void
}

const NAV_LINKS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutIcon },
  { href: '/metrics', label: 'Manual Entry', icon: PencilIcon },
  { href: '/alerts', label: 'Alert Rules', icon: BellIcon },
]

export default function Sidebar({ sections, userEmail, role, isOpen, onClose }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={clsx(
        'fixed inset-y-0 left-0 w-60 bg-white border-r border-gray-100 flex flex-col z-50 transition-transform duration-200',
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Brand */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-hdpm-dark text-white flex items-center justify-center text-sm font-bold">
              H
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900 block leading-tight">HDPM</span>
              <span className="text-[10px] text-gray-400 leading-tight">CEO Dashboard</span>
            </div>
          </div>
        </div>

        {/* Page nav */}
        <nav className="px-3 pt-4 pb-2 space-y-0.5">
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-300">Pages</p>
          {NAV_LINKS.map(link => {
            // Only show alerts/metrics for ceo/manager
            if ((link.href === '/metrics' || link.href === '/alerts') && role === 'viewer') return null
            const active = pathname === link.href
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={clsx(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition',
                  active
                    ? 'bg-hdpm-dark/10 text-hdpm-dark font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <link.icon className="w-4 h-4 shrink-0" />
                {link.label}
              </a>
            )
          })}
        </nav>

        {/* Section anchors */}
        <nav className="flex-1 px-3 pb-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-300">Sections</p>
          {sections.map(s => (
            <a
              key={s.key}
              href={`/dashboard#${s.key}`}
              onClick={onClose}
              className="block px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition"
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
            className="mt-3 text-xs text-gray-400 hover:text-red-500 transition"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}

/* ─── Inline icons (avoid adding a dependency) ─────────────────────────── */

function LayoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
  )
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  )
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  )
}
