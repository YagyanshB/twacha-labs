'use client';

import { Shield, Lock, FileText, User, Database, Trash2 } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav>
        <div className="nav-container">
          <a href="/" className="logo">
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
          </a>
          <div className="nav-right">
            <a href="/" className="text-sm text-gray-600 hover:text-gray-900">Back to Home</a>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[#1E293B] mb-4">Privacy Policy</h1>
          <p className="text-lg text-[#52525B]">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Data Controller */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-[#1E293B]">Data Controller</h2>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <p className="text-[#52525B] leading-relaxed mb-4">
              <strong className="text-[#1E293B]">Twacha Labs</strong> is the data controller responsible for processing your personal data.
            </p>
            <div className="space-y-2 text-sm text-[#52525B]">
              <p><strong>Company Name:</strong> Twacha Labs</p>
              <p><strong>Legal Entity:</strong> [PLACEHOLDER: Insert legal entity name]</p>
              <p><strong>Registered Address:</strong> [PLACEHOLDER: Insert registered address]</p>
              <p><strong>Contact Email:</strong> privacy@twachalabs.com</p>
              <p><strong>Data Protection Officer:</strong> [PLACEHOLDER: Insert DPO contact if applicable]</p>
            </div>
          </div>
        </section>

        {/* Special Category Data */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-2xl font-semibold text-[#1E293B]">Special Category Data Processing</h2>
          </div>
          <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
            <p className="text-[#52525B] leading-relaxed mb-4">
              Under GDPR Article 9, biometric data (including facial images) is classified as <strong>special category data</strong>. 
              We process this data only with your explicit consent.
            </p>
            <ul className="space-y-2 text-sm text-[#52525B]">
              <li>• <strong>Legal Basis:</strong> Explicit consent (GDPR Article 9(2)(a))</li>
              <li>• <strong>Purpose:</strong> Skin analysis and personalized recommendations</li>
              <li>• <strong>Retention:</strong> Data is retained until you request deletion or withdraw consent</li>
              <li>• <strong>Sharing:</strong> We do not share biometric data with third parties without your explicit consent</li>
            </ul>
          </div>
        </section>

        {/* Rights of the Data Subject */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-[#1E293B]">Rights of the Data Subject</h2>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="text-[#52525B] leading-relaxed mb-6">
              Under GDPR, you have the following rights regarding your personal data:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-[#1E293B] mb-2">Right of Access</h3>
                <p className="text-sm text-[#52525B]">
                  You can request a copy of all personal data we hold about you.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-[#1E293B] mb-2">Right to Rectification</h3>
                <p className="text-sm text-[#52525B]">
                  You can request correction of inaccurate or incomplete data.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-[#1E293B] mb-2">Right to Erasure</h3>
                <p className="text-sm text-[#52525B]">
                  You can request deletion of your data ("Right to be Forgotten").
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-[#1E293B] mb-2">Right to Restrict Processing</h3>
                <p className="text-sm text-[#52525B]">
                  You can request that we limit how we use your data.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-[#1E293B] mb-2">Right to Data Portability</h3>
                <p className="text-sm text-[#52525B]">
                  You can request your data in a machine-readable format.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-[#1E293B] mb-2">Right to Object</h3>
                <p className="text-sm text-[#52525B]">
                  You can object to processing based on legitimate interests.
                </p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-[#52525B]">
                <strong>To exercise these rights:</strong> Contact us at privacy@twachalabs.com with your request. 
                We will respond within 30 days as required by GDPR.
              </p>
            </div>
          </div>
        </section>

        {/* ML Research Data Usage */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Database className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-semibold text-[#1E293B]">ML Research Data Usage</h2>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="text-[#52525B] leading-relaxed mb-4">
              [PLACEHOLDER: Insert your ML research data usage policy]
            </p>
            <div className="space-y-4 text-sm text-[#52525B]">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-[#1E293B] mb-2">Anonymized Data for Research</h3>
                <p>
                  [PLACEHOLDER: Describe if/how anonymized data is used for ML model improvement, 
                  research purposes, etc. Include opt-in/opt-out mechanisms if applicable.]
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-[#1E293B] mb-2">Data Sharing with Research Partners</h3>
                <p>
                  [PLACEHOLDER: Describe any data sharing arrangements with research institutions, 
                  universities, or ML research partners. Include consent mechanisms.]
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-[#1E293B] mb-2">Model Training and Improvement</h3>
                <p>
                  [PLACEHOLDER: Explain how user data contributes to model training, 
                  whether data is anonymized, and how users can opt out.]
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Security */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-semibold text-[#1E293B]">Data Security</h2>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <ul className="space-y-3 text-[#52525B]">
              <li className="flex items-start gap-3">
                <span className="text-indigo-600 mt-1">✓</span>
                <span><strong>Encryption:</strong> All data is encrypted in transit (TLS) and at rest</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-600 mt-1">✓</span>
                <span><strong>Access Controls:</strong> Strict access controls and authentication for all systems</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-600 mt-1">✓</span>
                <span><strong>Infrastructure:</strong> GDPR-compliant cloud infrastructure with regular security audits</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-600 mt-1">✓</span>
                <span><strong>Data Minimization:</strong> We only collect data necessary for providing the service</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="font-semibold text-[#1E293B] mb-3">Questions or Concerns?</h3>
            <p className="text-[#52525B] mb-2">
              If you have questions about this privacy policy or wish to exercise your rights, please contact us:
            </p>
            <p className="text-sm text-[#52525B]">
              <strong>Email:</strong> privacy@twachalabs.com<br />
              <strong>Subject Line:</strong> "GDPR Request - [Your Request Type]"
            </p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <div className="footer-brand">Twacha Labs</div>
          <div className="footer-links">
            <a href="/privacy">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
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
