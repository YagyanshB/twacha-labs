'use client'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Matches landing page exactly */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-black rounded"></div>
              <span className="text-base font-medium tracking-tight">Twacha Labs</span>
            </a>
            
            <div className="hidden md:flex items-center space-x-8 text-sm">
              <a href="/" className="text-gray-600 hover:text-black transition-colors">
                Home
              </a>
              <a href="/pricing" className="text-gray-600 hover:text-black transition-colors">
                Pricing
              </a>
              <a href="/privacy" className="text-black font-medium">
                Privacy
              </a>
            </div>

            <button className="md:hidden text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Same style as landing */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-light tracking-tight leading-[0.95] mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-500 font-light">
            How we collect, use, and protect your data
          </p>
          <p className="text-sm text-gray-400 mt-4">Last updated: January 2026</p>
        </div>
      </section>

      {/* Data Controller */}
      <section className="py-16 px-6 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-light mb-4">Data Controller</h2>
            <p className="text-gray-600 font-light leading-relaxed">
              Twacha Labs is the data controller responsible for processing your personal data.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Company Name</div>
              <p className="text-gray-900">Twacha Labs</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Legal Entity</div>
              <p className="text-gray-900">[Insert legal entity name]</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Registered Address</div>
              <p className="text-gray-900">[Insert registered address]</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Contact Email</div>
              <p className="text-gray-900">privacy@twachalabs.com</p>
            </div>
          </div>
        </div>
      </section>

      {/* Special Category Data */}
      <section className="py-16 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-light mb-4">Biometric Data Processing</h2>
            <p className="text-gray-600 font-light leading-relaxed">
              Under GDPR Article 9, facial images are classified as special category data. 
              We only process this data with your explicit consent.
            </p>
          </div>

          <div className="space-y-8">
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

      {/* Your Rights */}
      <section className="py-16 px-6 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-light mb-4">Your Rights</h2>
            <p className="text-gray-600 font-light leading-relaxed">
              Under GDPR, you have the following rights regarding your personal data.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            <div className="border-l-2 border-gray-200 pl-6">
              <h3 className="font-medium mb-2">Right of Access</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                You can request a copy of all personal data we hold about you.
              </p>
            </div>

            <div className="border-l-2 border-gray-200 pl-6">
              <h3 className="font-medium mb-2">Right to Rectification</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                You can request correction of inaccurate or incomplete data.
              </p>
            </div>

            <div className="border-l-2 border-gray-200 pl-6">
              <h3 className="font-medium mb-2">Right to Erasure</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                You can request deletion of your data ("Right to be Forgotten").
              </p>
            </div>

            <div className="border-l-2 border-gray-200 pl-6">
              <h3 className="font-medium mb-2">Right to Restrict Processing</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                You can request that we limit how we use your data.
              </p>
            </div>

            <div className="border-l-2 border-gray-200 pl-6">
              <h3 className="font-medium mb-2">Right to Data Portability</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                You can request your data in a machine-readable format.
              </p>
            </div>

            <div className="border-l-2 border-gray-200 pl-6">
              <h3 className="font-medium mb-2">Right to Object</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
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

      {/* Data Security */}
      <section className="py-16 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-light mb-4">Data Security</h2>
            <p className="text-gray-600 font-light leading-relaxed">
              We implement technical and organizational measures to protect your data.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <span className="font-medium">Encryption: </span>
                <span className="text-gray-600 font-light">All data is encrypted in transit (TLS) and at rest</span>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <span className="font-medium">Access Controls: </span>
                <span className="text-gray-600 font-light">Strict access controls and authentication for all systems</span>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <span className="font-medium">Infrastructure: </span>
                <span className="text-gray-600 font-light">GDPR-compliant cloud infrastructure with regular security audits</span>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <span className="font-medium">Data Minimization: </span>
                <span className="text-gray-600 font-light">We only collect data necessary for providing the service</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ML Research */}
      <section className="py-16 px-6 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-light mb-4">ML Research Data Usage</h2>
            <p className="text-gray-600 font-light leading-relaxed">
              With your consent, anonymized data may be used to improve our AI models.
            </p>
          </div>

          <div className="space-y-8">
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
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Research Partners</div>
              <p className="text-gray-900 font-light leading-relaxed">
                Anonymized data may be shared with clinical research institutions 
                under strict data processing agreements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-light mb-4">Questions or Concerns?</h2>
          <p className="text-gray-600 font-light leading-relaxed mb-8 max-w-2xl mx-auto">
            If you have questions about this privacy policy or wish to exercise your rights, 
            please contact us.
          </p>
          
          <div className="inline-block text-left">
            <div className="mb-4">
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-1">Email</div>
              <a href="mailto:privacy@twachalabs.com" className="text-black hover:opacity-70 transition-opacity">
                privacy@twachalabs.com
              </a>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-1">Subject Line</div>
              <p className="text-sm text-gray-600 font-light">
                "GDPR Request - [Your Request Type]"
              </p>
            </div>
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
              <a href="/privacy" className="text-white font-medium">
                Privacy
              </a>
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
