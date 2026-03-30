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
    <div className="flex min-h-screen">
      <Sidebar
        sections={sections}
        userEmail={userEmail}
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 flex items-center px-4 z-30 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 -ml-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <span className="ml-3 text-sm font-semibold text-gray-900">HDPM Dashboard</span>
      </div>

      <main className="flex-1 lg:ml-60 pt-14 lg:pt-0 p-4 sm:p-6 lg:p-8 max-w-7xl">
        {children}
      </main>
    </div>
  )
}
