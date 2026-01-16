'use client'

import React from 'react'
import Link from 'next/link'

// Twacha Labs - Terms of Service
// Minimal, clean design matching landing page aesthetic

export default function TermsOfService() {
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
        maxWidth: '680px',
        margin: '0 auto',
        padding: '80px 24px 120px',
      }}>
        <div style={{ marginBottom: '48px' }}>
          <p style={{
            fontSize: '13px',
            color: '#888',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '16px',
          }}>
            Legal
          </p>
          <h1 style={{
            fontSize: '42px',
            fontWeight: '600',
            letterSpacing: '-0.03em',
            marginBottom: '16px',
            lineHeight: 1.1,
          }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: '15px', color: '#888' }}>
            Last updated: January 16, 2026
          </p>
        </div>

        <div style={{
          fontSize: '16px',
          lineHeight: 1.8,
          color: '#444',
        }}>
          <section style={{ marginBottom: '48px' }}>
            <p style={{ marginBottom: '24px' }}>
              Welcome to Twacha Labs. By using our services, you agree to these terms. 
              Please read them carefully.
            </p>
          </section>

          <section style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#0a0a0a',
              marginBottom: '16px',
              letterSpacing: '-0.01em',
            }}>
              1. Service Description
            </h2>
            <p style={{ marginBottom: '16px' }}>
              Twacha Labs provides AI-powered skin analysis services designed for men. Our service 
              analyzes facial images to provide insights about skin health, including hydration levels, 
              texture, pore health, and other metrics.
            </p>
            <p>
              <strong style={{ color: '#0a0a0a' }}>Important:</strong> Our service is for informational 
              purposes only and does not constitute medical advice. For medical skin conditions, please 
              consult a qualified dermatologist.
            </p>
          </section>

          <section style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#0a0a0a',
              marginBottom: '16px',
              letterSpacing: '-0.01em',
            }}>
              2. Account Registration
            </h2>
            <p style={{ marginBottom: '16px' }}>To use our services, you must:</p>
            <ul style={{ paddingLeft: '24px' }}>
              <li style={{ marginBottom: '8px' }}>Be at least 18 years old</li>
              <li style={{ marginBottom: '8px' }}>Provide accurate account information</li>
              <li style={{ marginBottom: '8px' }}>Maintain the security of your account credentials</li>
              <li style={{ marginBottom: '8px' }}>Notify us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#0a0a0a',
              marginBottom: '16px',
              letterSpacing: '-0.01em',
            }}>
              3. Acceptable Use
            </h2>
            <p style={{ marginBottom: '16px' }}>You agree not to:</p>
            <ul style={{ paddingLeft: '24px' }}>
              <li style={{ marginBottom: '8px' }}>Upload images of anyone other than yourself without their consent</li>
              <li style={{ marginBottom: '8px' }}>Use the service for any illegal purpose</li>
              <li style={{ marginBottom: '8px' }}>Attempt to reverse engineer our AI algorithms</li>
              <li style={{ marginBottom: '8px' }}>Share your account with others</li>
              <li style={{ marginBottom: '8px' }}>Use automated tools to access the service</li>
            </ul>
          </section>

          <section style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#0a0a0a',
              marginBottom: '16px',
              letterSpacing: '-0.01em',
            }}>
              4. Intellectual Property
            </h2>
            <p style={{ marginBottom: '16px' }}>
              All content, features, and functionality of Twacha Labs—including our AI models, 
              algorithms, design, and branding—are owned by Twacha Labs and protected by intellectual 
              property laws.
            </p>
            <p>
              You retain ownership of any images you upload. By uploading images, you grant us a 
              limited license to process them for the purpose of providing our services.
            </p>
          </section>

          <section style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#0a0a0a',
              marginBottom: '16px',
              letterSpacing: '-0.01em',
            }}>
              5. Disclaimer of Warranties
            </h2>
            <p style={{ marginBottom: '16px' }}>
              Our service is provided "as is" without warranties of any kind. We do not guarantee:
            </p>
            <ul style={{ paddingLeft: '24px' }}>
              <li style={{ marginBottom: '8px' }}>The accuracy of skin analysis results</li>
              <li style={{ marginBottom: '8px' }}>That the service will be uninterrupted or error-free</li>
              <li style={{ marginBottom: '8px' }}>That recommendations will achieve specific results</li>
            </ul>
          </section>

          <section style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#0a0a0a',
              marginBottom: '16px',
              letterSpacing: '-0.01em',
            }}>
              6. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, Twacha Labs shall not be liable for any 
              indirect, incidental, special, consequential, or punitive damages resulting from 
              your use of the service, including any decisions made based on our analysis results.
            </p>
          </section>

          <section style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#0a0a0a',
              marginBottom: '16px',
              letterSpacing: '-0.01em',
            }}>
              7. Modifications to Service
            </h2>
            <p>
              We reserve the right to modify, suspend, or discontinue any part of our service at 
              any time. We will provide reasonable notice of significant changes when possible.
            </p>
          </section>

          <section style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#0a0a0a',
              marginBottom: '16px',
              letterSpacing: '-0.01em',
            }}>
              8. Termination
            </h2>
            <p>
              We may terminate or suspend your account at our discretion if you violate these terms. 
              You may also delete your account at any time through your dashboard settings or by 
              contacting us.
            </p>
          </section>

          <section style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#0a0a0a',
              marginBottom: '16px',
              letterSpacing: '-0.01em',
            }}>
              9. Governing Law
            </h2>
            <p>
              These terms are governed by the laws of the jurisdiction in which Twacha Labs operates. 
              Any disputes will be resolved through binding arbitration, except where prohibited by law.
            </p>
          </section>

          <section>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#0a0a0a',
              marginBottom: '16px',
              letterSpacing: '-0.01em',
            }}>
              10. Contact
            </h2>
            <p>
              For questions about these Terms of Service, contact us at{' '}
              <a href="mailto:legal@twachalabs.io" style={{ color: '#0a0a0a', textDecoration: 'underline' }}>
                legal@twachalabs.io
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #f0f0f0',
        padding: '32px 40px',
      }}>
        <div style={{
          maxWidth: '680px',
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
            <Link href="/contact" style={{ fontSize: '13px', color: '#888', textDecoration: 'none' }}>Contact</Link>
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        
        a:hover {
          opacity: 0.7;
        }
      `}</style>
    </div>
  )
}
