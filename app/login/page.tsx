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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <nav className="w-full bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link 
              href="/" 
              className="flex items-center space-x-2 group"
            >
              <div className="w-6 h-6 bg-black rounded-sm"></div>
              <span className="text-base font-medium tracking-tight text-gray-900 group-hover:text-black transition-colors">
                Twacha Labs
              </span>
            </Link>
            
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-light"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content - Split Screen Layout */}
      <div className="flex-1 flex">
        {/* Left Panel - Branding/Gradient */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
          
          <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white">
            <div className="max-w-md text-center">
              <div className="mb-8">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 mx-auto border border-white/20">
                  <div className="w-8 h-8 bg-white rounded-sm"></div>
                </div>
              </div>
              <h2 className="text-3xl font-light tracking-tight mb-4">
                Welcome back
              </h2>
              <p className="text-gray-300 font-light leading-relaxed text-lg">
                Sign in to continue your skin health journey with AI-powered analysis and personalized recommendations.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Branding */}
            <div className="lg:hidden mb-8 text-center">
              <Link href="/" className="inline-flex items-center space-x-2 mb-6">
                <div className="w-6 h-6 bg-black rounded-sm"></div>
                <span className="text-base font-medium tracking-tight">Twacha Labs</span>
              </Link>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 lg:p-10">
              <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-gray-900 mb-3">
                  Sign in
                </h1>
                <p className="text-gray-500 font-light text-sm leading-relaxed">
                  Enter your email to receive a magic link. No password required.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label 
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      disabled={loading}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-3.5 rounded-lg font-medium hover:bg-gray-900 active:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group shadow-sm hover:shadow-md"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      <span>Sending magic link...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      <span>Send magic link</span>
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {message && (
                <div
                  className={`mt-6 p-4 rounded-lg flex items-start space-x-3 animate-in fade-in slide-in-from-top-2 ${
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
                    className={`text-sm font-light ${
                      message.type === 'success' ? 'text-green-900' : 'text-red-900'
                    }`}
                  >
                    {message.text}
                  </p>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-500 leading-relaxed text-center font-light">
                  By signing in, you agree to our{' '}
                  <Link 
                    href="/privacy" 
                    className="underline hover:text-gray-900 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  . We'll never share your email or send spam.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
