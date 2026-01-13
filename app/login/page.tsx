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
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative">
        {/* Pattern overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Back link */}
        <Link
          href="/"
          className="absolute top-8 left-8 text-sm text-gray-400 hover:text-white transition-colors z-10"
        >
          ← Back to home
        </Link>
        
        {/* Centered content */}
        <div className="flex items-center justify-center w-full h-full">
          <div className="max-w-md text-center px-12">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="w-8 h-8 bg-white rounded-md"></div>
              <span className="text-xl font-medium text-white">Twacha Labs</span>
            </div>
            <h2 className="text-3xl font-light text-white mb-4">
              Welcome back
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Sign in to continue your skin health journey with AI-powered analysis and personalized recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-black rounded-sm"></div>
              <span className="text-base font-medium">Twacha Labs</span>
            </Link>
            <Link
              href="/"
              className="block text-sm text-gray-500 hover:text-gray-900"
            >
              ← Back to home
            </Link>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-200 p-10">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                Sign in
              </h1>
              <p className="text-gray-500">
                Enter your email to receive a magic link.<br />
                No password required.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label 
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all disabled:opacity-50 hover:border-gray-300 text-base"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium text-base hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center group"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    <span>Send magic link</span>
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {message && (
              <div
                className={`mt-6 p-4 rounded-xl flex items-start space-x-3 ${
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
                    message.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {message.text}
                </p>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 text-center">
                By signing in, you agree to our{' '}
                <Link 
                  href="/privacy" 
                  className="text-gray-900 hover:underline"
                >
                  Privacy Policy
                </Link>
                .<br />
                We'll never share your email or send spam.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
