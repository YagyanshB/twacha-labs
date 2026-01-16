'use client'

import React, { useState } from 'react'
import Link from 'next/link'

// Twacha Labs - Contact Page
// Minimal, clean design matching landing page aesthetic

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Replace with actual form submission (e.g., to Supabase or email service)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafafa',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: '#0a0a0a',
    }}>
      {/* Header */}
      <header style={{
        padding: '20px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
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
          <span style={{ fontSize: '17px', fontWeight: '600', letterSpacing: '-0.01em' }}>
            Twacha Labs
          </span>
        </Link>
        
        <Link 
          href="/"
          style={{
            fontSize: '14px',
            color: '#666',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to home
        </Link>
      </header>

      {/* Content */}
      <main style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '80px 24px 120px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '80px',
          alignItems: 'start',
        }}>
          {/* Left: Info */}
          <div>
            <p style={{
              fontSize: '13px',
              color: '#888',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '16px',
            }}>
              Contact
            </p>
            <h1 style={{
              fontSize: '42px',
              fontWeight: '600',
              letterSpacing: '-0.03em',
              marginBottom: '24px',
              lineHeight: 1.1,
            }}>
              Get in touch
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#666',
              lineHeight: 1.7,
              marginBottom: '48px',
            }}>
              Have a question about our skin analysis? Want to report an issue or share feedback? 
              We'd love to hear from you.
            </p>

            {/* Contact Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <p style={{
                  fontSize: '13px',
                  color: '#888',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}>
                  Email
                </p>
                <a 
                  href="mailto:hello@twachalabs.io"
                  style={{
                    fontSize: '16px',
                    color: '#0a0a0a',
                    textDecoration: 'none',
                  }}
                >
                  hello@twachalabs.io
                </a>
              </div>

              <div>
                <p style={{
                  fontSize: '13px',
                  color: '#888',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}>
                  Support
                </p>
                <a 
                  href="mailto:support@twachalabs.io"
                  style={{
                    fontSize: '16px',
                    color: '#0a0a0a',
                    textDecoration: 'none',
                  }}
                >
                  support@twachalabs.io
                </a>
              </div>

              <div>
                <p style={{
                  fontSize: '13px',
                  color: '#888',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}>
                  Response Time
                </p>
                <p style={{ fontSize: '16px', color: '#0a0a0a' }}>
                  Usually within 24 hours
                </p>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#666',
                    marginBottom: '8px',
                  }}>
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'white',
                      border: '1px solid #e5e5e5',
                      borderRadius: '10px',
                      color: '#0a0a0a',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#0a0a0a'}
                    onBlur={e => e.target.style.borderColor = '#e5e5e5'}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
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
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'white',
                      border: '1px solid #e5e5e5',
                      borderRadius: '10px',
                      color: '#0a0a0a',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#0a0a0a'}
                    onBlur={e => e.target.style.borderColor = '#e5e5e5'}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#666',
                    marginBottom: '8px',
                  }}>
                    Subject
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'white',
                      border: '1px solid #e5e5e5',
                      borderRadius: '10px',
                      color: '#0a0a0a',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#0a0a0a'}
                    onBlur={e => e.target.style.borderColor = '#e5e5e5'}
                  >
                    <option value="general">General inquiry</option>
                    <option value="support">Technical support</option>
                    <option value="feedback">Product feedback</option>
                    <option value="privacy">Privacy & data request</option>
                    <option value="partnership">Partnership opportunity</option>
                  </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#666',
                    marginBottom: '8px',
                  }}>
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    required
                    rows={5}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'white',
                      border: '1px solid #e5e5e5',
                      borderRadius: '10px',
                      color: '#0a0a0a',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                      minHeight: '120px',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#0a0a0a'}
                    onBlur={e => e.target.style.borderColor = '#e5e5e5'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '14px 32px',
                    background: isSubmitting ? '#666' : '#0a0a0a',
                    border: 'none',
                    borderRadius: '100px',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '500',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                  }}
                >
                  {isSubmitting ? (
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
                    'Send message'
                  )}
                </button>
              </form>
            ) : (
              <div style={{
                background: 'white',
                border: '1px solid #e5e5e5',
                borderRadius: '16px',
                padding: '48px 32px',
                textAlign: 'center',
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
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  letterSpacing: '-0.02em',
                }}>
                  Message sent
                </h2>
                
                <p style={{
                  fontSize: '15px',
                  color: '#666',
                  lineHeight: 1.6,
                  marginBottom: '24px',
                }}>
                  Thanks for reaching out. We'll get back to you within 24 hours.
                </p>

                <button
                  onClick={() => {
                    setIsSubmitted(false)
                    setFormData({ name: '', email: '', subject: 'general', message: '' })
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
                  Send another message
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #f0f0f0',
        padding: '32px 40px',
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <p style={{ fontSize: '13px', color: '#888' }}>
            © 2026 Twacha Labs. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/privacy" style={{ fontSize: '13px', color: '#888', textDecoration: 'none' }}>Privacy</Link>
            <Link href="/terms" style={{ fontSize: '13px', color: '#888', textDecoration: 'none' }}>Terms</Link>
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        a:hover {
          opacity: 0.7;
        }
        
        input::placeholder,
        textarea::placeholder {
          color: #b0b0b0;
        }
        
        button:hover:not(:disabled) {
          opacity: 0.9;
        }
      `}</style>
    </div>
  )
}
