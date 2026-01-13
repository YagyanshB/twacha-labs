'use client';

import { Check, ArrowRight, Shield, Lock } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function PricingPage() {
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [email, setEmail] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          consent_given: consentGiven 
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Waitlist error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Matches landing page */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-black rounded"></div>
              <span className="text-base font-medium tracking-tight">Twacha Labs</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8 text-sm">
              <Link href="/" className="text-gray-600 hover:text-black transition-colors">
                Home
              </Link>
              <Link href="/pricing" className="text-black font-medium">
                Pricing
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-black transition-colors">
                Privacy
              </Link>
              <Link href="/analysis" className="text-black font-medium">
                Start free →
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-light tracking-tight mb-6">
            Transparent pricing for clinical skin health
          </h1>
          <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto mb-8">
            Start free. Upgrade when you're ready. Cancel anytime.
          </p>
          
          {/* System Status Ticker */}
          <div className="mt-12 font-mono text-sm text-gray-600 space-x-6 flex items-center justify-center">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>[ SYSTEM: OPERATIONAL ]</span>
            </span>
            <span className="hidden sm:inline">|</span>
            <span>[ BATCH_001: 14/50 REMAINING ]</span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Tier 1: Standard (Free) */}
            <div className="border border-gray-200 rounded-2xl p-8 hover:border-gray-300 transition">
              <div className="mb-8">
                <h3 className="text-2xl font-medium mb-2">Standard</h3>
                <p className="text-sm text-gray-600 font-light">
                  Free digital analysis
                </p>
              </div>

              <div className="mb-8">
                <div className="text-5xl font-light mb-2">£0</div>
                <div className="text-sm text-gray-500">Forever free</div>
              </div>

              <Link 
                href="/analysis"
                className="w-full border border-gray-900 text-gray-900 py-3 rounded-full font-medium hover:bg-gray-50 transition mb-8 flex items-center justify-center"
              >
                Start free analysis
              </Link>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-900 font-light">1 basic AI scan per month</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-900 font-light">GAGS score overview</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-900 font-light">General blemish education</span>
                </div>
              </div>
            </div>

            {/* Tier 2: The Precision Kit - Featured */}
            <div className="border-2 border-black rounded-2xl p-8 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-black text-white px-4 py-1 rounded-full text-xs font-medium">
                  Recommended for Launch
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-medium mb-2">The Precision Kit</h3>
                <p className="text-sm text-gray-600 font-light">
                  One-time hardware purchase
                </p>
              </div>

              <div className="mb-8">
                <div className="text-5xl font-light mb-2">£24</div>
                <div className="text-sm text-gray-500">One-time purchase</div>
              </div>

              {!showWaitlist ? (
                <button 
                  onClick={() => setShowWaitlist(true)}
                  className="w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 transition mb-8 flex items-center justify-center group"
                >
                  Reserve Kit
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : submitted ? (
                <div className="w-full bg-green-50 text-green-700 py-3 rounded-full font-medium mb-8 flex items-center justify-center">
                  <Check className="w-4 h-4 mr-2" />
                  Reserved! Check your email
                </div>
              ) : (
                <form onSubmit={handleWaitlistSubmit} className="mb-8 space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
                  />
                  <label className="flex items-start space-x-2 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      required
                      className="mt-0.5"
                    />
                    <span>I consent to biometric data processing (GDPR Article 9)</span>
                  </label>
                  <button
                    type="submit"
                    disabled={loading || !consentGiven}
                    className="w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Reserving...' : 'Reserve Kit'}
                  </button>
                </form>
              )}

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-900 font-light">15x Macro Lens (Universal Clip)</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-900 font-light">5x Sterile Lancets</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-900 font-light">10x Hydrocolloid Patches</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-900 font-light">Clinical Protocol Card</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-900 font-light">1 month Lab Elite access included</span>
                </div>
              </div>
            </div>

            {/* Tier 3: Lab Elite Membership */}
            <div className="border border-gray-200 rounded-2xl p-8 hover:border-gray-300 transition">
              <div className="mb-8">
                <h3 className="text-2xl font-medium mb-2">Lab Elite Membership</h3>
                <p className="text-sm text-gray-600 font-light">
                  Recurring clinical monitoring
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-5xl font-light">£8.99</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <div className="text-sm text-gray-500">
                  Cancel anytime
                </div>
              </div>

              <button className="w-full border border-gray-900 text-gray-900 py-3 rounded-full font-medium hover:bg-gray-50 transition mb-8">
                Subscribe
              </button>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-900 font-light">Unlimited 15x Scans</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-900 font-light">Longitudinal Progress Tracking (Graphs)</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-900 font-light">Quarterly Refill Boxes (Lancets/Patches)</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-900 font-light">NHS-ready Referral PDF exports</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional note */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-600 font-light">
              All plans include GDPR-compliant data protection and end-to-end encryption
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-light tracking-tight mb-12 text-center">
            Frequently asked questions
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="font-medium mb-3">When will The Precision Kit ship?</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                The first batch (Batch 001) ships on February 14th, 2026. We have 14 of 50 kits remaining. 
                Reserve yours now to secure your spot in this batch.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-3">Is the 15x Macro Lens compatible with my phone?</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Yes. The Universal Clip design works with all modern smartphones (iPhone and Android). 
                The clip attaches securely to your phone's camera, providing clinical-grade 15x magnification 
                for accurate skin analysis.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-3">How is my biometric data protected?</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Under GDPR Article 9, facial images are classified as special category data. We only process 
                this data with your explicit consent. All data is encrypted in transit (TLS) and at rest. 
                We never share your biometric data with third parties without your explicit consent. 
                See our <Link href="/privacy" className="underline">privacy policy</Link> for full details.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-3">What's included in the free Standard tier?</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                You get one basic AI scan per month with GAGS score overview and general blemish education. 
                Perfect for trying out the service and understanding your skin health baseline.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-3">Can I cancel Lab Elite Membership anytime?</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Yes. Cancel your subscription anytime with no penalties or fees. You'll retain access until 
                the end of your billing period. No questions asked.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-3">What are the Quarterly Refill Boxes?</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Lab Elite members receive a refill box every quarter containing sterile lancets and 
                hydrocolloid patches. This ensures you always have the supplies needed for clinical-grade 
                skin monitoring at home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-20 px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="font-medium mb-2">Clinical-Grade Encryption</h3>
              <p className="text-sm text-gray-600 font-light">
                All biometric data encrypted at rest and in transit using industry-leading protocols
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="font-medium mb-2">Biometric Data Privacy</h3>
              <p className="text-sm text-gray-600 font-light">
                GDPR Article 9 compliant. Explicit consent required. No third-party sharing without permission
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-light tracking-tight mb-6">
            Ready to start?
          </h2>
          <p className="text-xl text-gray-600 font-light mb-10">
            Begin with a free analysis today
          </p>
          <Link 
            href="/analysis"
            className="bg-black text-white px-10 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition inline-flex items-center group"
          >
            Start free analysis
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer - Same as landing */}
      <footer className="bg-black text-white px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-8 md:space-y-0 mb-8">
            <div>
              <div className="font-medium mb-2">Twacha Labs</div>
              <div className="text-sm text-gray-400">Advanced dermatological analysis</div>
            </div>
            
            <div className="flex space-x-8 text-sm">
              <Link href="/privacy" className="text-white font-medium">
                Privacy
              </Link>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-xs text-gray-500">
            © 2026 Twacha Labs. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
