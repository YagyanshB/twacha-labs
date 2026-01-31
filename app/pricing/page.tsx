// app/pricing/page.tsx - FULLY RESPONSIVE

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [showReportModal, setShowReportModal] = useState(false);
  const router = useRouter();

  const monthlyPrice = 8.99;
  const annualPrice = 89.99;
  const annualMonthly = (annualPrice / 12).toFixed(2);
  const savingsPercent = Math.round((1 - annualPrice / (monthlyPrice * 12)) * 100);

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      {/* Header - Responsive */}
      <header style={{
        position: 'sticky',
        top: 0,
        background: 'white',
        borderBottom: '1px solid #eee',
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            color: '#0a0a0a',
            fontWeight: '600',
            fontSize: '18px',
          }}>
            <svg width="24" height="24" viewBox="0 0 40 40">
              <g transform="translate(10, 10)" fill="#000">
                <circle cx="10" cy="10" r="2"/>
                <circle cx="10" cy="4" r="1.5" opacity="0.8"/>
                <circle cx="16" cy="10" r="1.5" opacity="0.8"/>
                <circle cx="10" cy="16" r="1.5" opacity="0.8"/>
                <circle cx="4" cy="10" r="1.5" opacity="0.8"/>
                <circle cx="6" cy="6" r="1" fill="#0066ff"/>
                <circle cx="14" cy="6" r="1" fill="#0066ff"/>
                <circle cx="14" cy="14" r="1" fill="#0066ff"/>
                <circle cx="6" cy="14" r="1" fill="#0066ff"/>
                <path d="M4 10 L16 10 M10 4 L10 16" stroke="#000" strokeWidth="0.5" opacity="0.3"/>
              </g>
            </svg>
            <span>Twacha Labs</span>
          </Link>

          {/* Desktop nav - hidden on mobile via CSS */}
          <nav className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link href="/#how-it-works" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
              How it works
            </Link>
            <Link href="/pricing" style={{ color: '#0a0a0a', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
              Pricing
            </Link>
            <button
              onClick={() => router.push('/login')}
              style={{
                padding: '10px 20px',
                background: '#0a0a0a',
                color: 'white',
                border: 'none',
                borderRadius: '100px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Start Free Scan
            </button>
          </nav>

          {/* Mobile: Just show CTA button */}
          <button
            className="mobile-only"
            onClick={() => router.push('/login')}
            style={{
              padding: '10px 16px',
              background: '#0a0a0a',
              color: 'white',
              border: 'none',
              borderRadius: '100px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Start Free Scan
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '40px 16px 60px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{
              fontSize: 'clamp(32px, 8vw, 48px)',
              fontWeight: '700',
              marginBottom: '12px',
            }}>
              Simple pricing
            </h1>
            <p style={{ fontSize: 'clamp(14px, 4vw, 18px)', color: '#666' }}>
              Start free. Upgrade when you're ready. Cancel anytime.
            </p>
          </div>

          {/* Pricing Cards - Stack on mobile */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            maxWidth: '400px',
            margin: '0 auto',
          }}>
            {/* Free Plan */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '28px 24px',
              border: '1px solid #e5e5e5',
            }}>
              <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '6px' }}>Free</h3>
              <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
                Perfect for trying it out.
              </p>

              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '36px', fontWeight: '700' }}>Free</span>
                <span style={{ color: '#888', marginLeft: '8px', fontSize: '14px' }}>forever</span>
              </div>

              <button
                onClick={() => router.push('/login')}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'white',
                  color: '#0a0a0a',
                  border: '2px solid #e5e5e5',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '20px',
                }}
              >
                Get Started
              </button>

              <ul style={{ listStyle: 'none', padding: 0 }}>
                {['5 scans per month', 'Basic skin analysis', 'General recommendations'].map((f) => (
                  <li key={f} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '10px',
                    fontSize: '14px',
                    color: '#444',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Premium Plan */}
            <div style={{
              background: '#0a0a0a',
              color: 'white',
              borderRadius: '20px',
              padding: '28px 24px',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'white',
                color: '#0a0a0a',
                padding: '6px 14px',
                borderRadius: '100px',
                fontSize: '11px',
                fontWeight: '600',
                letterSpacing: '0.5px',
              }}>
                MOST POPULAR
              </div>

              <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '6px' }}>Premium</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px', fontSize: '14px' }}>
                For serious skin progress.
              </p>

              {/* Billing Toggle - HORIZONTAL, not vertical */}
              <div style={{
                display: 'flex',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '4px',
                marginBottom: '20px',
              }}>
                <button
                  onClick={() => setBillingCycle('monthly')}
                  style={{
                    flex: 1,
                    padding: '12px 8px',
                    background: billingCycle === 'monthly' ? 'white' : 'transparent',
                    color: billingCycle === 'monthly' ? '#0a0a0a' : 'rgba(255,255,255,0.7)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  style={{
                    flex: 1,
                    padding: '12px 8px',
                    background: billingCycle === 'annual' ? 'white' : 'transparent',
                    color: billingCycle === 'annual' ? '#0a0a0a' : 'rgba(255,255,255,0.7)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>Annual</span>
                  <span style={{
                    padding: '2px 6px',
                    background: '#22c55e',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '700',
                  }}>
                    -{savingsPercent}%
                  </span>
                </button>
              </div>

              {/* Price */}
              <div style={{ marginBottom: '20px' }}>
                {billingCycle === 'monthly' ? (
                  <div>
                    <span style={{ fontSize: '36px', fontWeight: '700' }}>£{monthlyPrice}</span>
                    <span style={{ opacity: 0.7, fontSize: '14px' }}>/month</span>
                  </div>
                ) : (
                  <div>
                    <span style={{ fontSize: '36px', fontWeight: '700' }}>£{annualMonthly}</span>
                    <span style={{ opacity: 0.7, fontSize: '14px' }}>/month</span>
                    <p style={{ fontSize: '13px', opacity: 0.6, marginTop: '4px' }}>
                      £{annualPrice} billed annually
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push('/login')}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'white',
                  color: '#0a0a0a',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '20px',
                }}
              >
                {billingCycle === 'annual' ? 'Get Annual Plan' : 'Go Premium'}
              </button>

              <ul style={{ listStyle: 'none', padding: 0 }}>
                {['Unlimited scans', 'Advanced metrics', 'Progress tracking', 'Priority support'].map((f) => (
                  <li key={f} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '10px',
                    fontSize: '14px',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Report - Simpler card */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid #e5e5e5',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}>
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>Dermatology Report</h4>
                <p style={{ color: '#666', fontSize: '13px' }}>One-time comprehensive PDF</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '700', fontSize: '20px' }}>£14.99</div>
                <button
                  onClick={() => setShowReportModal(true)}
                  style={{
                    marginTop: '8px',
                    padding: '8px 16px',
                    background: '#f5f5f5',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>

          {/* Trust badge */}
          <p style={{
            textAlign: 'center',
            color: '#888',
            fontSize: '13px',
            marginTop: '32px'
          }}>
            🔒 Secure payment via Stripe • Cancel anytime
          </p>
        </div>
      </main>

      {/* Report Modal */}
      {showReportModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            maxWidth: '360px',
            width: '100%',
            padding: '32px 24px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '24px',
            }}>
              📄
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
              Coming Soon
            </h2>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px', lineHeight: 1.6 }}>
              Dermatology reports are launching in February 2026. Get comprehensive PDF analysis to share with your doctor.
            </p>
            <button
              onClick={() => setShowReportModal(false)}
              style={{
                width: '100%',
                padding: '14px',
                background: '#0a0a0a',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* CSS for responsive show/hide */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: block !important; }
        }
        @media (min-width: 769px) {
          .desktop-only { display: flex !important; }
          .mobile-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}
