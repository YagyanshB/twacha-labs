'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PricingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Pricing calculations
  const monthlyPrice = 8.99;
  const annualPrice = 89.99;
  const annualMonthly = (annualPrice / 12).toFixed(2); // £7.50
  const savingsPercent = Math.round((1 - annualPrice / (monthlyPrice * 12)) * 100); // 17%

  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      {/* Header */}
      <nav style={{
        padding: '20px 40px',
        borderBottom: '1px solid #e5e5e5',
        background: 'white',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Link href="/" style={{
            fontSize: '18px',
            fontWeight: '600',
            textDecoration: 'none',
            color: '#0a0a0a',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <Link href="/#how-it-works" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
              How it works
            </Link>
            <Link href="/pricing" style={{ color: '#0a0a0a', textDecoration: 'none', fontSize: '14px' }}>
              Pricing
            </Link>
            <button
              onClick={() => router.push('/login')}
              style={{
                padding: '10px 24px',
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
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ padding: '80px 40px 100px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{ fontSize: '56px', fontWeight: '700', marginBottom: '16px', color: '#0a0a0a', letterSpacing: '-1px' }}>
              Simple pricing
            </h1>
            <p style={{ fontSize: '18px', color: '#666', fontWeight: '400' }}>
              Start free. Upgrade when you're ready. Cancel anytime.
            </p>
          </div>

          {/* Pricing Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
            maxWidth: '1100px',
            margin: '0 auto',
          }}>
            {/* Free Plan */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '40px 32px',
              border: '1px solid #e5e5e5',
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#0a0a0a' }}>
                Free
              </h3>
              <p style={{ color: '#666', marginBottom: '32px', fontSize: '14px', minHeight: '20px' }}>
                Perfect for testing the waters.
              </p>

              <div style={{ marginBottom: '32px' }}>
                <span style={{ fontSize: '48px', fontWeight: '700', color: '#0a0a0a' }}>£0</span>
              </div>

              <button
                onClick={() => router.push('/login')}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: '#0a0a0a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '32px',
                }}
              >
                Start Free Scan
              </button>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {['5 scans per month', 'Basic skin analysis', 'General recommendations'].map((f) => (
                  <li key={f} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    marginBottom: '12px',
                    fontSize: '14px',
                    color: '#444',
                    lineHeight: '1.5',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
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
              padding: '40px 32px',
              position: 'relative',
              border: 'none',
            }}>
              <div style={{
                position: 'absolute',
                top: '-14px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'white',
                color: '#0a0a0a',
                padding: '6px 20px',
                borderRadius: '100px',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.5px',
              }}>
                MOST POPULAR
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                Premium
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '32px', fontSize: '14px', minHeight: '20px' }}>
                For serious skin progress.
              </p>

              {/* Billing Toggle */}
              <div style={{
                display: 'inline-flex',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '4px',
                marginBottom: '24px',
              }}>
                <button
                  onClick={() => setBillingCycle('monthly')}
                  style={{
                    padding: '10px 24px',
                    background: billingCycle === 'monthly' ? 'white' : 'transparent',
                    color: billingCycle === 'monthly' ? '#0a0a0a' : 'rgba(255,255,255,0.7)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  style={{
                    padding: '10px 24px',
                    background: billingCycle === 'annual' ? 'white' : 'transparent',
                    color: billingCycle === 'annual' ? '#0a0a0a' : 'rgba(255,255,255,0.7)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Annual
                </button>
              </div>

              {/* Price Display */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '48px', fontWeight: '700' }}>
                    £{billingCycle === 'monthly' ? monthlyPrice : annualMonthly}
                  </span>
                  <span style={{ fontSize: '18px', opacity: 0.7, marginLeft: '4px' }}>/month</span>
                </div>
                {billingCycle === 'annual' && (
                  <p style={{ fontSize: '14px', opacity: 0.7, margin: 0 }}>
                    Or £{annualPrice}/year (Save {savingsPercent}%)
                  </p>
                )}
              </div>

              <button
                onClick={() => setShowPaymentModal(true)}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'white',
                  color: '#0a0a0a',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '32px',
                }}
              >
                Go Premium
              </button>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  'Unlimited scans',
                  'Advanced metrics (Texture, Aging)',
                  'Progress tracking timeline',
                  'Personalized routine builder',
                  'Priority support',
                ].map((f) => (
                  <li key={f} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    marginBottom: '12px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Report Option */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '40px 32px',
              border: '1px solid #e5e5e5',
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#0a0a0a' }}>
                Report
              </h3>
              <p style={{ color: '#666', marginBottom: '32px', fontSize: '14px', minHeight: '20px' }}>
                Deep-dive one-time analysis.
              </p>

              <div style={{ marginBottom: '32px' }}>
                <span style={{ fontSize: '48px', fontWeight: '700', color: '#0a0a0a' }}>£14.99</span>
                <span style={{ fontSize: '18px', color: '#888', marginLeft: '4px' }}>/once</span>
              </div>

              <button
                onClick={() => setShowReportModal(true)}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: '#0a0a0a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '32px',
                }}
              >
                Get Report
              </button>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  'Full comprehensive report',
                  'Downloadable PDF',
                  'Shareable with dermatologists',
                  'Valid for 7 days',
                ].map((f) => (
                  <li key={f} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    marginBottom: '12px',
                    fontSize: '14px',
                    color: '#444',
                    lineHeight: '1.5',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer */}
          <p style={{ textAlign: 'center', color: '#888', fontSize: '14px', marginTop: '60px' }}>
            🔒 Secure payment processing • Cancel anytime • No hidden fees
          </p>
        </div>
      </main>

      {/* Payment Coming Soon Modal */}
      {showPaymentModal && (
        <div
          onClick={() => setShowPaymentModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              padding: '48px 40px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowPaymentModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                background: '#f5f5f5',
                cursor: 'pointer',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
              }}
            >
              ×
            </button>

            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px', color: '#0a0a0a' }}>
              Premium Coming Soon
            </h2>
            <p style={{
              fontSize: '15px',
              color: '#666',
              marginBottom: '32px',
              lineHeight: 1.6
            }}>
              We're setting up secure payment processing. Premium features will be available very soon!
            </p>

            <button
              onClick={() => setShowPaymentModal(false)}
              style={{
                width: '100%',
                padding: '14px',
                background: '#0a0a0a',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Got it
            </button>

            <p style={{ fontSize: '13px', color: '#888', marginTop: '20px' }}>
              In the meantime, enjoy unlimited free scans!
            </p>
          </div>
        </div>
      )}

      {/* Report Coming Soon Modal */}
      {showReportModal && (
        <div
          onClick={() => setShowReportModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              padding: '48px 40px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowReportModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                background: '#f5f5f5',
                cursor: 'pointer',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
              }}
            >
              ×
            </button>

            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px', color: '#0a0a0a' }}>
              Dermatology Reports
            </h2>
            <p style={{
              fontSize: '15px',
              color: '#666',
              marginBottom: '32px',
              lineHeight: 1.6
            }}>
              Comprehensive PDF reports are coming soon. Get detailed analysis you can share with your dermatologist.
            </p>

            <button
              onClick={() => setShowReportModal(false)}
              style={{
                width: '100%',
                padding: '14px',
                background: '#0a0a0a',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Got it
            </button>

            <p style={{ fontSize: '13px', color: '#888', marginTop: '20px' }}>
              Expected: February 2026
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
