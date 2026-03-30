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
  { href: '/dashboard', label: 'Overview', icon: GridIcon },
  { href: '/metrics', label: 'Manual Entry', icon: PlusIcon },
  { href: '/alerts', label: 'Alerts', icon: BellIcon },
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
          className="fixed inset-0 bg-[rgba(8,7,26,0.7)] backdrop-blur-md z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={clsx(
        'fixed inset-y-0 left-0 w-[260px] flex flex-col z-50',
        'bg-[rgba(12,11,28,0.65)] backdrop-blur-3xl border-r border-[rgba(255,255,255,0.04)]',
        'transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Inner light refraction */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[rgba(255,255,255,0.02)] to-transparent pointer-events-none rounded-tr-3xl" />

        {/* Brand */}
        <div className="relative px-6 py-7">
          <div className="flex items-center gap-3.5">
            <div className="relative group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6bab39] via-[#22d3ee] to-[#a78bfa] flex items-center justify-center shadow-[0_0_24px_rgba(107,171,57,0.25)] transition-shadow duration-500 group-hover:shadow-[0_0_36px_rgba(107,171,57,0.4)]">
                <span className="text-[#08071a] font-extrabold text-lg select-none">H</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#34d399] border-2 border-[#0d0c22] shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            </div>
            <div>
              <span className="text-[13px] font-bold text-[#f0eff8] block leading-tight tracking-[0.08em]">
                HDPM
              </span>
              <span className="text-[10px] text-[#5c5878] leading-tight font-mono tracking-[0.12em]">
                EXECUTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Subtle divider */}
        <div className="mx-6 h-px bg-gradient-to-r from-[rgba(167,139,250,0.12)] via-[rgba(34,211,238,0.08)] to-transparent" />

        {/* Navigation */}
        <nav className="relative px-4 pt-6 pb-3 space-y-1">
          <p className="px-3 mb-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#5c5878] font-mono">
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
                  'group flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[13px] cursor-pointer',
                  'transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]',
                  active
                    ? 'bg-[rgba(255,255,255,0.06)] text-[#f0eff8] font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_20px_rgba(167,139,250,0.06)]'
                    : 'text-[#a09cb8] hover:bg-[rgba(255,255,255,0.03)] hover:text-[#f0eff8]'
                )}
              >
                <link.icon className={clsx(
                  'w-[17px] h-[17px] shrink-0 transition-all duration-400',
                  active && 'text-[#a78bfa] drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]'
                )} />
                {link.label}
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#a78bfa] shadow-[0_0_8px_rgba(167,139,250,0.6)]" />
                )}
              </a>
            )
          })}
        </nav>

        {/* Sections */}
        <nav className="flex-1 px-4 pb-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#5c5878] font-mono">
            Sections
          </p>
          {sections.map((s, i) => {
            const hue = 150 + i * 35
            return (
              <a
                key={s.key}
                href={`/dashboard#${s.key}`}
                onClick={onClose}
                className="group flex items-center gap-3 px-3 py-2 rounded-2xl text-[13px] text-[#5c5878] hover:text-[#a09cb8] hover:bg-[rgba(255,255,255,0.02)] transition-all duration-300 cursor-pointer"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0 transition-transform duration-300 group-hover:scale-150"
                  style={{
                    background: `hsl(${hue}, 65%, 60%)`,
                    boxShadow: `0 0 6px hsla(${hue}, 65%, 60%, 0.4)`,
                  }}
                />
                {s.label}
              </a>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.04)] to-transparent" />

        {/* User */}
        <div className="relative px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center backdrop-blur-sm">
              <span className="text-[11px] font-bold text-[#a78bfa]">
                {userEmail.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-[#a09cb8] truncate">{userEmail}</p>
              <p className="text-[9px] text-[#34d399] uppercase tracking-[0.15em] font-bold font-mono mt-0.5">{role}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-4 text-[10px] text-[#5c5878] hover:text-[#f472b6] transition-colors duration-300 font-mono tracking-wider cursor-pointer"
          >
            SIGN OUT
          </button>
        </div>
      </aside>
    </>
  )
}

/* ─── Refined icons ────────────────────────────────────────────── */

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
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
