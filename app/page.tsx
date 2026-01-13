'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const handleStartScan = () => {
    window.location.href = '/analysis';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Ultra Minimal Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm z-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex justify-between items-center h-24">
            <Link href="/" className="text-lg font-medium tracking-tight">
              Twacha Labs
            </Link>
            
            <div className="hidden md:flex items-center space-x-12 text-sm">
              <a href="#technology" className="text-gray-600 hover:text-black transition">
                Technology
              </a>
              <a href="#about" className="text-gray-600 hover:text-black transition">
                About
              </a>
              <Link href="/pricing" className="text-gray-600 hover:text-black transition">
                Pricing
              </Link>
              <button 
                onClick={handleStartScan}
                className="text-black font-medium"
              >
                Book scan →
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero - Ultra Minimal - Centered */}
      <section className="min-h-screen flex items-center justify-center px-8 pt-24">
        <div className="text-center max-w-3xl">
          <h1 className="text-7xl lg:text-8xl font-light tracking-tight leading-[0.95] mb-8">
            Your skin
            <br />
            <span className="font-normal">decoded</span>
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed mb-12 max-w-xl mx-auto font-light">
            Advanced dermatological analysis. Personalized insights. Clinical precision.
          </p>
          
          <button 
            onClick={handleStartScan}
            className="group inline-flex items-center text-lg font-medium"
          >
            Start your analysis
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Three Column Features - Brutally Simple */}
      <section className="px-8 py-32 border-t border-gray-200" id="technology">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-16">
            <div>
              <div className="text-6xl font-light mb-6">01</div>
              <h3 className="text-xl font-medium mb-4">Scan</h3>
              <p className="text-gray-600 leading-relaxed font-light">
                Upload your image. Our AI analyzes over 200 dermatological markers in seconds.
              </p>
            </div>
            
            <div>
              <div className="text-6xl font-light mb-6">02</div>
              <h3 className="text-xl font-medium mb-4">Analyze</h3>
              <p className="text-gray-600 leading-relaxed font-light">
                Machine learning trained on clinical data provides accurate skin health assessment.
              </p>
            </div>
            
            <div>
              <div className="text-6xl font-light mb-6">03</div>
              <h3 className="text-xl font-medium mb-4">Act</h3>
              <p className="text-gray-600 leading-relaxed font-light">
                Receive personalized recommendations and track your skin health journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dermal Report - Minimal Card */}
      <section className="px-8 py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <h2 className="text-5xl font-light tracking-tight mb-6">
              Clinical-grade reporting
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-2xl">
              Detailed analysis. Clear insights. Actionable recommendations.
            </p>
          </div>
          
          {/* Report Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-12">
            <div className="flex items-start justify-between mb-12 pb-8 border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-medium mb-2">Dermal Analysis</h3>
                <p className="text-gray-500 text-sm">Report ID: SCAN-MRA5951</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Stable</span>
              </div>
            </div>
            
            <div className="space-y-8 mb-12">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="text-xs uppercase tracking-widest text-gray-400 mb-3">Condition</div>
                  <p className="text-gray-900">No visible concerns</p>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-gray-400 mb-3">GAGS Score</div>
                  <p className="text-gray-900">1/4</p>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-gray-400 mb-3">Confidence</div>
                  <p className="text-gray-900">95%</p>
                </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-gray-200">
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-4">Recommendation</div>
              <p className="text-gray-900 leading-relaxed font-light">
                Maintain current skincare routine with gentle cleansing. Regular monitoring advised. Professional care only for any interventions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats - Minimal */}
      <section className="px-8 py-32" id="about">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-16 text-center">
            <div>
              <div className="text-6xl font-light mb-4">95%</div>
              <div className="text-gray-600 font-light">Clinical accuracy</div>
            </div>
            <div>
              <div className="text-6xl font-light mb-4">50K+</div>
              <div className="text-gray-600 font-light">Scans completed</div>
            </div>
            <div>
              <div className="text-6xl font-light mb-4">&lt;60s</div>
              <div className="text-gray-600 font-light">Analysis time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Note - Subtle */}
      <section className="px-8 py-32 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h3 className="text-3xl font-light mb-6">Your data, protected</h3>
              <p className="text-gray-600 leading-relaxed font-light">
                GDPR compliant. End-to-end encryption. Your biometric data is processed with explicit consent and never shared without permission.
              </p>
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-1 h-1 bg-black rounded-full mt-2"></div>
                <div>
                  <div className="font-medium mb-1">Encrypted storage</div>
                  <div className="text-gray-600 text-sm font-light">All data encrypted at rest and in transit</div>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-1 h-1 bg-black rounded-full mt-2"></div>
                <div>
                  <div className="font-medium mb-1">No data sharing</div>
                  <div className="text-gray-600 text-sm font-light">We never share your biometric data with third parties</div>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-1 h-1 bg-black rounded-full mt-2"></div>
                <div>
                  <div className="font-medium mb-1">Full transparency</div>
                  <div className="text-gray-600 text-sm font-light">Request or delete your data anytime</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Minimal */}
      <section className="px-8 py-32 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl lg:text-6xl font-light tracking-tight mb-6">
            Begin your analysis
          </h2>
          <p className="text-xl text-gray-600 mb-12 font-light">
            Clinical-grade skin health insights in under 60 seconds
          </p>
          <button 
            onClick={handleStartScan}
            className="group inline-flex items-center text-lg font-medium border-b-2 border-black pb-1 hover:border-gray-600 transition"
          >
            Get started
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer - Ultra Minimal */}
      <footer className="px-8 py-16 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-8 md:space-y-0">
            <div>
              <div className="text-lg font-medium mb-2">Twacha Labs</div>
              <div className="text-sm text-gray-500">Advanced dermatological analysis</div>
            </div>
            
            <div className="flex space-x-12 text-sm">
              <Link href="/privacy" className="text-gray-600 hover:text-black transition">Privacy</Link>
              <a href="#" className="text-gray-600 hover:text-black transition">Terms</a>
              <a href="#" className="text-gray-600 hover:text-black transition">Contact</a>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-200 text-xs text-gray-400">
            © 2026 Twacha Labs. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
