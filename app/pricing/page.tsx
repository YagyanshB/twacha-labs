'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check } from 'lucide-react';

const STRIPE_LINKS = {
  monthly: 'https://buy.stripe.com/7sYeVd8gndhhckNghE24001',
  annual: 'https://buy.stripe.com/4gM9ATbsz0uvacFc1o24003',
  earlyBird: 'https://buy.stripe.com/3cI28r2W37WX0C5ghE24004',
};

interface EarlyBirdStatus {
  available: boolean;
  spotsRemaining: number;
  spotsTaken: number;
  percentageTaken: number;
}

export default function PricingPage() {
  const router = useRouter();
  const [earlyBirdStatus, setEarlyBirdStatus] = useState<EarlyBirdStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEarlyBird = async () => {
      try {
        const res = await fetch('/api/early-bird-status');
        const data = await res.json();
        setEarlyBirdStatus(data);
      } catch (error) {
        console.error('Error checking early bird status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkEarlyBird();
  }, []);

  const handlePlanSelect = (plan: 'monthly' | 'annual' | 'earlyBird') => {
    if (plan === 'earlyBird' && earlyBirdStatus && !earlyBirdStatus.available) {
      alert('Early bird offer has ended! Please choose Monthly or Annual.');
      return;
    }

    // Redirect to Stripe
    window.location.href = STRIPE_LINKS[plan];
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav>
        <div className="nav-container">
          <Link href="/" className="logo">
            <svg className="logo-mark" viewBox="0 0 40 40">
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
            <span className="logo-text">Twacha Labs</span>
          </Link>
          <div className="nav-right">
            <ul className="nav-links">
              <li><Link href="/#how">How it works</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
            </ul>
            <Link href="/login" className="scan-button">Start Free Scan</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section className="pricing-section">
        <div className="pricing-container">
          {/* Header */}
          <div className="pricing-header">
            <h1>Simple pricing</h1>
            <p>Start free. Upgrade when you're ready. Cancel anytime.</p>
          </div>

          {/* Early Bird Banner */}
          {!loading && earlyBirdStatus?.available && (
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '32px',
              textAlign: 'center',
              border: '2px solid #f59e0b',
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f59e0b',
                color: 'white',
                padding: '6px 16px',
                borderRadius: '100px',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                🎉 EARLY BIRD OFFER
              </div>

              <h3 style={{
                fontSize: '28px',
                fontWeight: '700',
                marginBottom: '12px',
                color: '#0a0a0a',
              }}>
                First 100 users get lifetime discount!
              </h3>

              <p style={{
                color: '#92400e',
                marginBottom: '20px',
                fontSize: '16px',
              }}>
                Only <strong style={{ fontSize: '20px' }}>{earlyBirdStatus.spotsRemaining}</strong> spots remaining
              </p>

              {/* Progress bar */}
              <div style={{
                width: '100%',
                maxWidth: '500px',
                height: '10px',
                background: 'rgba(0,0,0,0.1)',
                borderRadius: '100px',
                margin: '0 auto 24px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${earlyBirdStatus.percentageTaken}%`,
                  height: '100%',
                  background: '#f59e0b',
                  borderRadius: '100px',
                  transition: 'width 0.5s ease',
                }} />
              </div>

              <button
                onClick={() => handlePlanSelect('earlyBird')}
                style={{
                  padding: '16px 48px',
                  background: '#0a0a0a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '100px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Claim Early Bird Price →
              </button>
            </div>
          )}

          {/* Pricing Grid */}
          <div className="pricing-grid">
            {/* Free Plan */}
            <div className="pricing-card">
              <div className="pricing-card-content">
                <h3>Free</h3>
                <p className="pricing-description">Perfect for testing the waters.</p>

                <div className="pricing-price">
                  <span className="price-amount">£0</span>
                </div>

                <Link href="/login" className="primary-cta pricing-button">
                  Start Free Scan
                </Link>

                <ul className="pricing-features">
                  {['5 scans per month', 'Basic skin analysis', 'General recommendations'].map((feature) => (
                    <li key={feature}>
                      <Check className="feature-icon" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="pricing-card pricing-card-popular">
              <div className="popular-badge">Most Popular</div>

              <div className="pricing-card-content">
                <h3>Premium</h3>
                <p className="pricing-description">For serious skin progress.</p>

                <div className="pricing-price">
                  <span className="price-amount">£6.99</span>
                  <span className="price-period">/month</span>
                </div>

                <p className="pricing-subtext">Or £49/year (Save 42%)</p>

                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '24px',
                  width: '100%',
                }}>
                  <button
                    onClick={() => handlePlanSelect('monthly')}
                    style={{
                      flex: 1,
                      padding: '14px 20px',
                      background: 'white',
                      color: '#0a0a0a',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => handlePlanSelect('annual')}
                    style={{
                      flex: 1,
                      padding: '14px 20px',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Annual
                  </button>
                </div>

                <ul className="pricing-features">
                  {[
                    'Unlimited scans',
                    'Advanced metrics (Texture, Aging)',
                    'Progress tracking timeline',
                    'Personalized routine builder',
                    'Priority support',
                  ].map((feature) => (
                    <li key={feature}>
                      <Check className="feature-icon" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Report Plan */}
            <div className="pricing-card">
              <div className="pricing-card-content">
                <h3>Report</h3>
                <p className="pricing-description">Deep-dive one-time analysis.</p>

                <div className="pricing-price">
                  <span className="price-amount">£14.99</span>
                  <span className="price-period">/once</span>
                </div>

                <Link href="/login?plan=report" className="primary-cta pricing-button">
                  Get Report
                </Link>

                <ul className="pricing-features">
                  {[
                    'Full comprehensive report',
                    'Downloadable PDF',
                    'Shareable with dermatologists',
                    'Valid for 7 days',
                  ].map((feature) => (
                    <li key={feature}>
                      <Check className="feature-icon" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div style={{
            textAlign: 'center',
            marginTop: '48px',
            color: '#888',
            fontSize: '14px',
          }}>
            <p>🔒 Secure payment via Stripe • Cancel anytime • No hidden fees</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <div className="footer-brand">Twacha Labs</div>
          <div className="footer-links">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/subprocessors">Subprocessors</a>
            <a href="/contact">Contact</a>
          </div>
        </div>
        <div className="footer-security">
          <div className="footer-security-content">
            <div className="footer-security-title">Security & Compliance</div>
            <div className="footer-security-badges">
              <div className="footer-security-badge">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>GDPR Compliant</span>
              </div>
              <div className="footer-security-badge">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>End-to-End Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
