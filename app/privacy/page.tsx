'use client'

import Link from 'next/link'
import { Shield, Lock } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Matches landing page exactly */}
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
              <Link href="/pricing" className="text-gray-600 hover:text-black transition-colors">
                Pricing
              </Link>
              <Link href="/privacy" className="text-black font-medium">
                Privacy
              </Link>
            </div>

            <button className="md:hidden text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Minimal, centered */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-light tracking-tight leading-[0.95] mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-500 font-light mb-2">
            How we collect, use, and protect your data
          </p>
          <p className="text-sm text-gray-400">Last updated: January 2026</p>
        </div>
      </section>

      {/* How We Protect Your Data - Trust Signals (matching pricing page design) */}
      <section className="py-24 px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight mb-12 text-center">
            How we protect your data
          </h2>
          <p className="text-lg text-gray-600 font-light leading-relaxed text-center mb-16 max-w-2xl mx-auto">
            Your privacy is fundamental to everything we do. We implement industry-leading security measures to ensure your biometric data remains protected.
          </p>
          
          {/* Trust Signals Grid - Same design as pricing page */}
          <div className="grid md:grid-cols-2 gap-12 max-w-3xl mx-auto mb-16">
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

          {/* Additional Security Details */}
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <span className="font-medium">Access Controls: </span>
                <span className="text-gray-600 font-light">Strict authentication and authorization for all systems</span>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <span className="font-medium">Data Minimization: </span>
                <span className="text-gray-600 font-light">We only collect data necessary for providing the service</span>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <span className="font-medium">Infrastructure: </span>
                <span className="text-gray-600 font-light">GDPR-compliant cloud infrastructure with regular security audits</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Controller - Simplified */}
      <section className="py-24 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-light mb-6">Data Controller</h2>
          <p className="text-gray-600 font-light leading-relaxed mb-8">
            Twacha Labs is the data controller responsible for processing your personal data.
          </p>
          <div className="space-y-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-1">Company Name</div>
              <p className="text-gray-900">Twacha Labs</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-1">Contact Email</div>
              <a href="mailto:privacy@twachalabs.com" className="text-gray-900 hover:opacity-70 transition-opacity">
                privacy@twachalabs.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Biometric Data Processing - Simplified */}
      <section className="py-24 px-6 border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-light mb-6">Biometric Data Processing</h2>
          <p className="text-gray-600 font-light leading-relaxed mb-8">
            Under GDPR Article 9, facial images are classified as special category data. 
            We only process this data with your explicit consent.
          </p>
          <div className="space-y-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Legal Basis</div>
              <p className="text-gray-900 font-light">Explicit consent (GDPR Article 9(2)(a))</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Purpose</div>
              <p className="text-gray-900 font-light">Skin analysis and personalized recommendations</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Retention</div>
              <p className="text-gray-900 font-light">Data is retained until you request deletion or withdraw consent</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Sharing</div>
              <p className="text-gray-900 font-light">We do not share biometric data with third parties without your explicit consent</p>
            </div>
          </div>
        </div>
      </section>

      {/* Your Rights - Simplified grid */}
      <section className="py-24 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-light mb-6">Your Rights</h2>
          <p className="text-gray-600 font-light leading-relaxed mb-12">
            Under GDPR, you have the following rights regarding your personal data.
          </p>
          <div className="space-y-8">
            <div>
              <h3 className="font-medium mb-2 text-lg">Right of Access</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                You can request a copy of all personal data we hold about you.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-lg">Right to Rectification</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                You can request correction of inaccurate or incomplete data.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-lg">Right to Erasure</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                You can request deletion of your data ("Right to be Forgotten").
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-lg">Right to Restrict Processing</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                You can request that we limit how we use your data.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-lg">Right to Data Portability</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                You can request your data in a machine-readable format.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-lg">Right to Object</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                You can object to processing based on legitimate interests.
              </p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 font-light">
              To exercise these rights, contact us at privacy@twachalabs.com. 
              We will respond within 30 days as required by GDPR.
            </p>
          </div>
        </div>
      </section>

      {/* ML Research - Simplified */}
      <section className="py-24 px-6 border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-light mb-6">ML Research Data Usage</h2>
          <p className="text-gray-600 font-light leading-relaxed mb-8">
            With your consent, anonymized data may be used to improve our AI models.
          </p>
          <div className="space-y-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Anonymization</div>
              <p className="text-gray-900 font-light leading-relaxed">
                All personal identifiers are removed before data is used for research. 
                Images are anonymized and cannot be linked back to you.
              </p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Consent Mechanism</div>
              <p className="text-gray-900 font-light leading-relaxed">
                You can opt in or opt out of data usage for AI training at any time. 
                Withdrawal of consent does not affect data already used in model training.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact - Centered, minimal */}
      <section className="py-24 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-light mb-4">Questions or Concerns?</h2>
          <p className="text-gray-600 font-light leading-relaxed mb-8">
            If you have questions about this privacy policy or wish to exercise your rights, 
            please contact us.
          </p>
          <div>
            <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Email</div>
            <a href="mailto:privacy@twachalabs.com" className="text-black hover:opacity-70 transition-opacity text-lg">
              privacy@twachalabs.com
            </a>
          </div>
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
  )
}
