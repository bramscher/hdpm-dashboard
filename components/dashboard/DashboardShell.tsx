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

      {/* Mobile header — frosted glass bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-[rgba(8,7,26,0.6)] backdrop-blur-2xl border-b border-[rgba(255,255,255,0.04)] flex items-center px-5 z-30 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 rounded-2xl text-[#a09cb8] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0eff8] transition-all duration-300 cursor-pointer"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="ml-3 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#6bab39] via-[#22d3ee] to-[#a78bfa] flex items-center justify-center">
            <span className="text-[#08071a] font-extrabold text-[10px]">H</span>
          </div>
          <span className="text-sm font-semibold text-[#f0eff8] tracking-wider">HDPM</span>
        </div>
      </div>

      <main className="flex-1 lg:ml-[260px] pt-14 lg:pt-0 p-5 sm:p-7 lg:p-10 max-w-[1440px] relative z-[1]">
        {children}
      </main>
    </div>
  )
}
