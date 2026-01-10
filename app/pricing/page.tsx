'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '£0',
    description: 'Perfect for testing the waters.',
    cta: 'Start free analysis',
    href: '/analysis',
    popular: false,
    features: [
      '1 analysis per month',
      'Basic acne detection',
      'General recommendations',
    ],
  },
  {
    name: 'Premium',
    price: '£4.99',
    period: '/mo',
    description: 'For serious skin progress.',
    cta: 'Go Premium',
    href: '/checkout?plan=premium',
    popular: true,
    subtext: 'Billed £49 yearly (Save 17%)',
    features: [
      'Unlimited analyses',
      'Advanced metrics (Texture, Aging)',
      'Progress tracking timeline',
      'Personalized routine builder',
      'Priority support',
    ],
  },
  {
    name: 'Report',
    price: '£9.99',
    period: '/once',
    description: 'Deep-dive one-time analysis.',
    cta: 'Get Report',
    href: '/checkout?plan=onetime',
    popular: false,
    features: [
      'Full comprehensive report',
      'Downloadable PDF',
      'Shareable with dermatologists',
      'Valid for 7 days',
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - matches landing page */}
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
            <Link href="/analysis" className="scan-button">Start free</Link>
          </div>
        </div>
      </nav>

      {/* Pricing Section - matches landing page spacing and typography */}
      <section className="pricing-section">
        <div className="pricing-container">
          {/* Header - matches hero typography scale */}
          <div className="pricing-header">
            <h1>
              Simple pricing
            </h1>
            <p>Start free. Upgrade when you're ready. Cancel anytime.</p>
          </div>

          {/* Pricing Grid */}
          <div className="pricing-grid">
            {plans.map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer - matches landing page */}
      <footer>
        <div className="footer-content">
          <div className="footer-brand">Twacha Labs</div>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PricingCard({ plan }: { plan: typeof plans[0] }) {
  return (
    <div
      className={`pricing-card ${plan.popular ? 'pricing-card-popular' : ''}`}
    >
      {/* Most Popular Badge - centered at top */}
      {plan.popular && (
        <div className="popular-badge">Most Popular</div>
      )}

      <div className="pricing-card-content">
        <h3>{plan.name}</h3>
        <p className="pricing-description">{plan.description}</p>
        
        <div className="pricing-price">
          <span className="price-amount">{plan.price}</span>
          {plan.period && (
            <span className="price-period">{plan.period}</span>
          )}
        </div>

        {plan.subtext && (
          <p className="pricing-subtext">{plan.subtext}</p>
        )}

        {/* Button - matches landing page primary-cta */}
        <Link href={plan.href} className="primary-cta pricing-button">
          {plan.cta}
        </Link>

        {/* Features List */}
        <ul className="pricing-features">
          {plan.features.map((feature) => (
            <li key={feature}>
              <Check className="feature-icon" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
