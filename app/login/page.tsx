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
        text: 'Protocol initiated. Check your inbox for the magic link.',
      })
      setEmail('')
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Clinical system authentication failed',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex selection:bg-blue-100">
      {/* Left Panel - Branding (Dark Clinical) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#020617] relative overflow-hidden border-r border-slate-800">
        {/* Superior Pattern overlay: Smaller dots for higher density */}
        <div 
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #334155 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />
        
        {/* Atmospheric Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/5 filter blur-[120px] rounded-full" />
        
        <Link
          href="/"
          className="absolute top-12 left-12 text-xs font-mono uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors z-10"
        >
          [ back_to_home ]
        </Link>
        
        <div className="flex items-center justify-center w-full h-full relative z-10">
          <div className="max-w-sm text-center">
            <div className="flex items-center justify-center space-x-3 mb-10">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <div className="w-5 h-5 border-2 border-slate-950 rounded-sm" />
              </div>
              <span className="text-xl font-medium tracking-tight text-white">Twacha Labs</span>
            </div>
            <h2 className="text-4xl font-light tracking-tight text-white mb-6">
              Welcome back
            </h2>
            <p className="text-slate-400 font-light leading-relaxed px-4">
              Access your clinical dashboard to monitor your skin health journey and analyze scan progress.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 p-8 md:p-12">
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-medium text-slate-900 tracking-tight mb-3">
                Sign in
              </h1>
              <p className="text-slate-500 font-light text-sm">
                Enter your email to receive a secure magic link.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label 
                  htmlFor="email"
                  className="block text-[10px] uppercase tracking-widest font-semibold text-slate-400 ml-1"
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
                  className="w-full px-4 py-4 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all disabled:opacity-50 text-base"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-950 text-white py-4 rounded-2xl font-medium text-sm hover:bg-black transition-all shadow-lg shadow-slate-200 disabled:opacity-50 flex items-center justify-center group"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Send magic link</span>
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {message && (
              <div
                className={`mt-8 p-4 rounded-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                  message.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                    : 'bg-rose-50 text-rose-800 border border-rose-100'
                }`}
              >
                {message.type === 'success' ? (
                  <Check className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <p className="text-xs font-medium uppercase tracking-wide">
                  {message.text}
                </p>
              </div>
            )}

            <div className="mt-12 text-center border-t border-slate-100 pt-8">
              <p className="text-[11px] leading-relaxed text-slate-400">
                By signing in, you agree to our{' '}
                <Link href="/privacy" className="text-slate-900 hover:underline underline-offset-4">Privacy Policy</Link>
                <br />
                Protected by Clinical-Grade Encryption (AES-256).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
