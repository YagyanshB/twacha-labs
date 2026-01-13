'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowRight, Mail, Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      setMessage({
        type: 'success',
        text: 'Check your email for the magic link!',
      })
      setEmail('')
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Something went wrong',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="text-base font-medium tracking-tight">
              Twacha Labs
            </Link>
            
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-black transition"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </nav>

      {/* Login Form */}
      <div className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-md w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-4">
              Sign in
            </h1>
            <p className="text-gray-600 font-light leading-relaxed">
              Enter your email to receive a magic link.
              <br />
              No password required.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center group"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Sending magic link...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send magic link
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {message && (
            <div
              className={`mt-6 p-4 rounded-lg flex items-start space-x-3 ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm ${
                  message.type === 'success' ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-500 leading-relaxed text-center">
              By signing in, you agree to our{' '}
              <Link href="/privacy" className="underline hover:text-gray-900">
                Privacy Policy
              </Link>
              . We'll never share your email or send spam.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
