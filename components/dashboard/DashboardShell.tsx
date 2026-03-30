'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'

interface DashboardShellProps {
  sections: { key: string; label: string }[]
  userEmail: string
  role: string
  children: React.ReactNode
}

export default function DashboardShell({ sections, userEmail, role, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen relative">
      <Sidebar
        sections={sections}
        userEmail={userEmail}
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-[rgba(16,15,36,0.8)] backdrop-blur-2xl border-b border-[rgba(140,120,255,0.08)] flex items-center px-4 z-30 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-1 rounded-xl text-ink-secondary hover:bg-[rgba(167,139,250,0.08)] hover:text-ink-primary transition-all duration-200 cursor-pointer"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="ml-3 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-green via-neon-cyan to-neon-purple flex items-center justify-center">
            <span className="text-surface-deep font-extrabold text-[11px]">H</span>
          </div>
          <span className="text-sm font-bold text-ink-primary tracking-widest">HDPM</span>
        </div>
      </div>

      <main className="flex-1 lg:ml-[260px] pt-14 lg:pt-0 p-4 sm:p-6 lg:p-10 max-w-[1400px] relative z-[1]">
        {children}
      </main>
    </div>
  )
}
