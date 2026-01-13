'use client';

import React from 'react';
import { Shield, Lock, Eye, FileText, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-8">
          <div className="flex justify-between items-center h-24">
            <Link href="/" className="flex items-center text-gray-600 hover:text-black transition group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Twacha Labs
            </Link>
            <span className="text-sm text-gray-500">Last updated: January 2026</span>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-20 pb-16 px-8 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-light tracking-tight mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed max-w-2xl">
            Your privacy matters. This policy explains how Twacha Labs collects, 
            uses, and protects your personal data.
          </p>
        </div>
      </section>

      {/* Data Controller */}
      <section className="py-16 px-8 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start space-x-4 mb-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h2 className="text-3xl font-light mb-3">Data Controller</h2>
              <p className="text-gray-600 leading-relaxed font-light">
                Twacha Labs is the data controller responsible for processing your personal data.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 ml-16">
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
      <section className="py-16 px-8 border-b border-gray-200 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start space-x-4 mb-8">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h2 className="text-3xl font-light mb-3">Biometric Data Processing</h2>
              <p className="text-gray-600 leading-relaxed font-light">
                Under GDPR Article 9, facial images are classified as special category data. 
                We only process this data with your explicit consent.
              </p>
            </div>
          </div>

          <div className="ml-16 space-y-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Legal Basis</div>
              <p className="text-gray-900">Explicit consent (GDPR Article 9(2)(a))</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Purpose</div>
              <p className="text-gray-900">Skin analysis and personalized recommendations</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Retention</div>
              <p className="text-gray-900">Data is retained until you request deletion or withdraw consent</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Sharing</div>
              <p className="text-gray-900">We do not share biometric data with third parties without your explicit consent</p>
            </div>
          </div>
        </div>
      </section>

      {/* Your Rights */}
      <section className="py-16 px-8 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start space-x-4 mb-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Eye className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h2 className="text-3xl font-light mb-3">Your Rights</h2>
              <p className="text-gray-600 leading-relaxed font-light">
                Under GDPR, you have the following rights regarding your personal data.
              </p>
            </div>
          </div>

          <div className="ml-16 grid md:grid-cols-2 gap-x-12 gap-y-8">
            <div>
              <h3 className="font-medium mb-2">Right of Access</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                You can request a copy of all personal data we hold about you.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Right to Rectification</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                You can request correction of inaccurate or incomplete data.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Right to Erasure</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                You can request deletion of your data ("Right to be Forgotten").
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Right to Restrict Processing</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                You can request that we limit how we use your data.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Right to Data Portability</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                You can request your data in a machine-readable format.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Right to Object</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                You can object to processing based on legitimate interests.
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 ml-16">
            <p className="text-sm text-gray-600 font-light mb-4">
              To exercise these rights, contact us at privacy@twachalabs.com. 
              We will respond within 30 days as required by GDPR.
            </p>
          </div>
        </div>
      </section>

      {/* Data Security */}
      <section className="py-16 px-8 border-b border-gray-200 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start space-x-4 mb-8">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <h2 className="text-3xl font-light mb-3">Data Security</h2>
              <p className="text-gray-600 leading-relaxed font-light">
                We implement technical and organizational measures to protect your data.
              </p>
            </div>
          </div>

          <div className="ml-16 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-1 h-1 bg-black rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <span className="font-medium">Encryption:</span>
                <span className="text-gray-600 font-light"> All data is encrypted in transit (TLS) and at rest</span>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-1 h-1 bg-black rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <span className="font-medium">Access Controls:</span>
                <span className="text-gray-600 font-light"> Strict access controls and authentication for all systems</span>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-1 h-1 bg-black rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <span className="font-medium">Infrastructure:</span>
                <span className="text-gray-600 font-light"> GDPR-compliant cloud infrastructure with regular security audits</span>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-1 h-1 bg-black rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <span className="font-medium">Data Minimization:</span>
                <span className="text-gray-600 font-light"> We only collect data necessary for providing the service</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ML Research Data */}
      <section className="py-16 px-8 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start space-x-4 mb-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h2 className="text-3xl font-light mb-3">ML Research Data Usage</h2>
              <p className="text-gray-600 leading-relaxed font-light">
                With your consent, anonymized data may be used to improve our AI models.
              </p>
            </div>
          </div>

          <div className="ml-16 space-y-6">
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
      <section className="py-16 px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start space-x-4 mb-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h2 className="text-3xl font-light mb-3">Questions or Concerns?</h2>
              <p className="text-gray-600 leading-relaxed font-light mb-6">
                If you have questions about this privacy policy or wish to exercise your rights, 
                please contact us.
              </p>
              <div className="space-y-3">
                <div>
                  <div className="text-xs uppercase tracking-widest text-gray-400 mb-1">Email</div>
                  <a href="mailto:privacy@twachalabs.com" className="text-gray-900 hover:underline">
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
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">© 2026 Twacha Labs. All rights reserved.</span>
            <div className="flex space-x-8">
              <a href="/terms" className="text-gray-600 hover:text-black transition">Terms</a>
              <a href="/privacy" className="text-gray-900 font-medium">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
