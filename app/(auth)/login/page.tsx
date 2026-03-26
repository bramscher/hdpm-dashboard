'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function signInWithMicrosoft() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: 'email profile openid',
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-sm text-center">
        {/* Logo / wordmark */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600 text-white text-2xl font-bold mb-4">
            H
          </div>
          <h1 className="text-xl font-semibold text-gray-900">HDPM Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">High Desert Property Management</p>
        </div>

        <button
          onClick={signInWithMicrosoft}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* Microsoft logo SVG */}
          <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
            <rect x="1"  y="1"  width="9" height="9" fill="#F25022"/>
            <rect x="11" y="1"  width="9" height="9" fill="#7FBA00"/>
            <rect x="1"  y="11" width="9" height="9" fill="#00A4EF"/>
            <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
          </svg>
          {loading ? 'Signing in…' : 'Sign in with Microsoft'}
        </button>

        {error && (
          <p className="mt-4 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <p className="mt-8 text-xs text-gray-400">
          Access restricted to authorized HDPM staff
        </p>
      </div>
    </div>
  )
}
