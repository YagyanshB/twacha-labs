'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PricingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Pricing calculations
  const monthlyPrice = 8.99;
  const annualPrice = 89.99;
  const annualMonthly = (annualPrice / 12).toFixed(2); // £7.50
  const savingsPercent = Math.round((1 - annualPrice / (monthlyPrice * 12)) * 100); // 17%

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      {/* Header */}
      <header style={{
        padding: '20px 24px',
        borderBottom: '1px solid #eee',
        background: 'white',
      }}>
        <div style={{
          maxWidth: '1100px',
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
            <svg width="35" height="35" viewBox="0 0 40 40">
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
          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
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
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '60px 24px 80px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>
              Simple pricing
            </h1>
            <p style={{ fontSize: '18px', color: '#666' }}>
              Start free. Upgrade when you're ready. Cancel anytime.
            </p>
          </div>

          {/* Pricing Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            maxWidth: '900px',
            margin: '0 auto 48px',
          }}>
            {/* Free Plan */}
            <div style={{
              background: 'white',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid #e5e5e5',
            }}>
              <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '8px' }}>
                Free
              </h3>
              <p style={{ color: '#666', marginBottom: '24px', fontSize: '15px' }}>
                Perfect for trying it out.
              </p>

              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '40px', fontWeight: '700' }}>Free</span>
                <span style={{ color: '#888', marginLeft: '8px', fontSize: '15px' }}>forever</span>
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
                  marginBottom: '24px',
                }}
              >
                Get Started
              </button>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {['5 scans per month', 'Basic skin analysis', 'General recommendations'].map((f) => (
                  <li key={f} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '12px',
                    fontSize: '14px',
                    color: '#444',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
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
              borderRadius: '24px',
              padding: '32px',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'white',
                color: '#0a0a0a',
                padding: '6px 16px',
                borderRadius: '100px',
                fontSize: '12px',
                fontWeight: '600',
              }}>
                MOST POPULAR
              </div>

              <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '8px' }}>
                Premium
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px', fontSize: '15px' }}>
                For serious skin progress.
              </p>

              {/* Billing Toggle */}
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
                    padding: '10px 12px',
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
                    flex: 1,
                    padding: '10px 12px',
                    background: billingCycle === 'annual' ? 'white' : 'transparent',
                    color: billingCycle === 'annual' ? '#0a0a0a' : 'rgba(255,255,255,0.7)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  Annual
                  <span style={{
                    padding: '2px 6px',
                    background: billingCycle === 'annual' ? '#22c55e' : 'rgba(34,197,94,0.3)',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '700',
                  }}>
                    -{savingsPercent}%
                  </span>
                </button>
              </div>

              {/* Price Display */}
              <div style={{ marginBottom: '24px' }}>
                {billingCycle === 'monthly' ? (
                  <>
                    <span style={{ fontSize: '40px', fontWeight: '700' }}>£{monthlyPrice}</span>
                    <span style={{ opacity: 0.7, fontSize: '15px' }}>/month</span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '40px', fontWeight: '700' }}>£{annualMonthly}</span>
                    <span style={{ opacity: 0.7, fontSize: '15px' }}>/month</span>
                    <p style={{ fontSize: '13px', opacity: 0.6, marginTop: '4px' }}>
                      £{annualPrice} billed annually
                    </p>
                  </>
                )}
              </div>

              <button
                onClick={() => setShowPaymentModal(true)}
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
                  marginBottom: '24px',
                }}
              >
                {billingCycle === 'annual' ? 'Get Annual Plan' : 'Go Premium'}
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
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '12px',
                    fontSize: '14px',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
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
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid #e5e5e5',
            }}>
              <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '8px' }}>
                Report
              </h3>
              <p style={{ color: '#666', marginBottom: '24px', fontSize: '15px' }}>
                Deep-dive one-time analysis.
              </p>

              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '40px', fontWeight: '700' }}>£14.99</span>
                <span style={{ color: '#888', marginLeft: '8px', fontSize: '15px' }}>/once</span>
              </div>

              <button
                onClick={() => setShowReportModal(true)}
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
                  marginBottom: '24px',
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
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '12px',
                    fontSize: '14px',
                    color: '#444',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer */}
          <p style={{ textAlign: 'center', color: '#888', fontSize: '14px' }}>
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
            background: 'rgba(0,0,0,0.5)',
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
              borderRadius: '24px',
              maxWidth: '400px',
              width: '100%',
              padding: '40px 32px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setShowPaymentModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                background: '#f5f5f5',
                cursor: 'pointer',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>

            {/* Icon */}
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>
              Premium Coming Soon
            </h2>
            <p style={{
              fontSize: '15px',
              color: '#666',
              marginBottom: '28px',
              lineHeight: 1.6
            }}>
              We're setting up secure payment processing. Premium features will be available very soon!
            </p>

            {/* Features */}
            <div style={{
              background: '#f9fafb',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '28px',
              textAlign: 'left',
            }}>
              <p style={{ fontSize: '12px', color: '#888', marginBottom: '12px', fontWeight: '600' }}>
                WHAT YOU'LL GET WITH PREMIUM
              </p>
              {[
                'Unlimited scans',
                'Advanced metrics tracking',
                'Progress timeline',
                'Priority support',
              ].map((f) => (
                <div key={f} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  marginBottom: '8px',
                  color: '#444',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {f}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowPaymentModal(false)}
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

            <p style={{ fontSize: '13px', color: '#888', marginTop: '16px' }}>
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
            background: 'rgba(0,0,0,0.5)',
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
              borderRadius: '24px',
              maxWidth: '400px',
              width: '100%',
              padding: '40px 32px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setShowReportModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                background: '#f5f5f5',
                cursor: 'pointer',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>

            {/* Icon */}
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>
              Dermatology Reports
            </h2>
            <p style={{
              fontSize: '15px',
              color: '#666',
              marginBottom: '28px',
              lineHeight: 1.6
            }}>
              Comprehensive PDF reports are coming soon. Get detailed analysis
              you can share with your dermatologist.
            </p>

            {/* Features */}
            <div style={{
              background: '#f9fafb',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '28px',
              textAlign: 'left',
            }}>
              <p style={{ fontSize: '12px', color: '#888', marginBottom: '12px', fontWeight: '600' }}>
                WHAT YOU'LL GET
              </p>
              {[
                'Complete scan history',
                'Progress visualizations',
                'Personalized insights',
                'Shareable PDF format',
              ].map((f) => (
                <div key={f} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  marginBottom: '8px',
                  color: '#444',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {f}
                </div>
              ))}
            </div>

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

            <p style={{ fontSize: '13px', color: '#888', marginTop: '16px' }}>
              Expected: February 2026
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
