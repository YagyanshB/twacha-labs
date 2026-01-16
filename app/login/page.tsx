'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

// Twacha Labs - Minimal Login Page
// Matches the clean, light aesthetic of the landing page

export default function TwachaLogin() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      setIsLoading(false)
      setIsSent(true)
    } catch (error: any) {
      setIsLoading(false)
      // You can add error handling here if needed
      console.error('Login error:', error)
    }
  }

  const handleResend = async () => {
    if (!email) return
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      console.error('Resend error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafafa',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        padding: '20px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link 
          href="/"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            textDecoration: 'none',
            color: '#0a0a0a',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.7 }}>
            <circle cx="6" cy="6" r="2" fill="#0a0a0a"/>
            <circle cx="18" cy="6" r="2" fill="#0a0a0a"/>
            <circle cx="6" cy="18" r="2" fill="#0a0a0a"/>
            <circle cx="18" cy="18" r="2" fill="#0a0a0a"/>
            <circle cx="12" cy="12" r="2" fill="#0a0a0a"/>
          </svg>
          <span style={{
            fontSize: '17px',
            fontWeight: '600',
            letterSpacing: '-0.01em',
          }}>Twacha Labs</span>
        </Link>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.5s ease-out',
      }}>
        {!isSent ? (
          <div style={{
            width: '100%',
            maxWidth: '360px',
            textAlign: 'center',
          }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '600',
              letterSpacing: '-0.02em',
              marginBottom: '12px',
              color: '#0a0a0a',
            }}>
              Welcome back
            </h1>
            
            <p style={{
              fontSize: '15px',
              color: '#888',
              marginBottom: '40px',
              lineHeight: 1.5,
            }}>
              Enter your email to receive a sign-in link.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#666',
                  marginBottom: '8px',
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: 'white',
                    border: '1px solid #e5e5e5',
                    borderRadius: '10px',
                    color: '#0a0a0a',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#0a0a0a'}
                  onBlur={e => e.target.style.borderColor = '#e5e5e5'}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                style={{
                  width: '100%',
                  padding: '14px 32px',
                  background: isLoading ? '#666' : '#0a0a0a',
                  border: 'none',
                  borderRadius: '100px',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {isLoading ? (
                  <>
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      style={{ animation: 'spin 1s linear infinite' }}
                    >
                      <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Continue
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <p style={{
              marginTop: '24px',
              fontSize: '12px',
              color: '#b0b0b0',
              lineHeight: 1.5,
            }}>
              By continuing, you agree to our{' '}
              <Link href="/privacy" style={{ color: '#888', textDecoration: 'underline' }}>
                Privacy Policy
              </Link>
            </p>
          </div>
        ) : (
          <div style={{
            width: '100%',
            maxWidth: '360px',
            textAlign: 'center',
            animation: 'fadeIn 0.4s ease-out',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 24px',
              borderRadius: '50%',
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2">
                <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2"/>
                <path d="M22 6v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6"/>
                <path d="M22 6l-10 7L2 6"/>
              </svg>
            </div>
            
            <h1 style={{
              fontSize: '28px',
              fontWeight: '600',
              letterSpacing: '-0.02em',
              marginBottom: '12px',
              color: '#0a0a0a',
            }}>
              Check your email
            </h1>
            
            <p style={{
              fontSize: '15px',
              color: '#888',
              marginBottom: '8px',
              lineHeight: 1.5,
            }}>
              We sent a sign-in link to
            </p>
            
            <p style={{
              fontSize: '15px',
              fontWeight: '500',
              color: '#0a0a0a',
              marginBottom: '32px',
            }}>
              {email}
            </p>

            <button
              onClick={() => {
                setIsSent(false)
                setEmail('')
              }}
              style={{
                padding: '12px 24px',
                background: '#f5f5f5',
                border: 'none',
                borderRadius: '100px',
                color: '#666',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Use a different email
            </button>

            <p style={{
              marginTop: '32px',
              fontSize: '13px',
              color: '#b0b0b0',
            }}>
              Didn't receive the email?{' '}
              <button
                onClick={handleResend}
                disabled={isLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  textDecoration: 'underline',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                }}
              >
                Resend
              </button>
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        padding: '20px 40px',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '12px',
          color: '#ccc',
        }}>
          Protected by clinical-grade encryption
        </p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        input::placeholder {
          color: #b0b0b0;
        }
        
        button:hover:not(:disabled) {
          opacity: 0.9;
        }
      `}</style>
    </div>
  )
}
