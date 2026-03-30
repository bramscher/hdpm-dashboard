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
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={clsx(
        'fixed inset-y-0 left-0 w-[260px] flex flex-col z-50 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'bg-[rgba(16,15,36,0.85)] backdrop-blur-2xl border-r border-[rgba(140,120,255,0.08)]',
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Brand */}
        <div className="px-6 py-6">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-neon-green via-neon-cyan to-neon-purple flex items-center justify-center shadow-neon-green">
                <span className="text-surface-deep font-extrabold text-lg">H</span>
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface-deep status-dot-green" />
            </div>
            <div>
              <span className="text-sm font-bold text-ink-primary block leading-tight tracking-widest">
                HDPM
              </span>
              <span className="text-[10px] text-neon-cyan/70 leading-tight font-mono tracking-wider">
                EXECUTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Gradient divider */}
        <div className="mx-5 h-px bg-gradient-to-r from-neon-purple/20 via-neon-cyan/20 to-transparent" />

        {/* Page nav */}
        <nav className="px-4 pt-5 pb-3 space-y-1">
          <p className="px-3 mb-2.5 text-[9px] font-bold uppercase tracking-[0.2em] text-ink-muted font-mono">
            Navigate
          </p>
          {NAV_LINKS.map(link => {
            if ((link.href === '/metrics' || link.href === '/alerts') && role === 'viewer') return null
            const active = pathname === link.href
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={clsx(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-250',
                  active
                    ? 'bg-gradient-to-r from-neon-green/15 to-neon-cyan/10 text-neon-lime font-semibold shadow-[inset_0_0_0_1px_rgba(107,171,57,0.2)]'
                    : 'text-ink-secondary hover:bg-[rgba(167,139,250,0.06)] hover:text-ink-primary'
                )}
              >
                <link.icon className={clsx(
                  'w-[18px] h-[18px] shrink-0 transition-all duration-250',
                  active && 'drop-shadow-[0_0_6px_rgba(163,245,76,0.5)]'
                )} />
                {link.label}
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-lime shadow-[0_0_6px_rgba(163,245,76,0.6)]" />
                )}
              </a>
            )
          })}
        </nav>

        {/* Section anchors */}
        <nav className="flex-1 px-4 pb-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-2.5 text-[9px] font-bold uppercase tracking-[0.2em] text-ink-muted font-mono">
            Sections
          </p>
          {sections.map((s, i) => (
            <a
              key={s.key}
              href={`/dashboard#${s.key}`}
              onClick={onClose}
              className="group flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-ink-muted hover:text-ink-secondary hover:bg-[rgba(140,120,255,0.04)] transition-all duration-200"
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300 group-hover:scale-125"
                style={{
                  background: `hsl(${160 + i * 30}, 70%, 60%)`,
                  boxShadow: `0 0 4px hsla(${160 + i * 30}, 70%, 60%, 0.4)`,
                }}
              />
              {s.label}
            </a>
          ))}
        </nav>

        {/* Gradient divider */}
        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-neon-purple/15 to-neon-cyan/15" />

        {/* User footer */}
        <div className="px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 border border-[rgba(140,120,255,0.15)] flex items-center justify-center backdrop-blur-sm">
              <span className="text-xs font-bold text-neon-purple">
                {userEmail.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-ink-secondary truncate" title={userEmail}>{userEmail}</p>
              <p className="text-[10px] text-neon-green uppercase tracking-[0.15em] font-bold font-mono mt-0.5">{role}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-3 w-full text-left text-[11px] text-ink-muted hover:text-neon-magenta transition-colors duration-200 font-mono"
          >
            SIGN OUT
          </button>
        </div>
      </aside>
    </>
  )
}

/* ─── Icons ────────────────────────────────────────────────────────── */

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
