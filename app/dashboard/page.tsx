'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, loading, signOut } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600 font-light">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex justify-between items-center h-20">
            <span className="text-base font-medium">Twacha Labs</span>
            <div className="flex items-center space-x-6">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={signOut}
                className="text-sm text-gray-600 hover:text-black transition"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        <h1 className="text-5xl font-light mb-8">Dashboard</h1>
        <p className="text-xl text-gray-600 font-light mb-12">
          Welcome! You're successfully logged in.
        </p>

        <div className="border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 font-light mb-6">
            Ready to analyze your skin?
          </p>
          <Link
            href="/analysis"
            className="inline-flex items-center bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition"
          >
            Start Analysis →
          </Link>
        </div>
      </div>
    </div>
  )
}
