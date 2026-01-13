'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const handleStartScan = () => {
    window.location.href = '/analysis';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
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

      {/* Hero Section - Full viewport height, centered */}
      <section className="min-h-screen flex items-center justify-center px-8">
        <div className="text-center max-w-4xl">
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-light tracking-tight leading-[0.95] mb-10">
            Your skin
            <br />
            <span className="font-normal">decoded</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-light mb-14 max-w-3xl mx-auto">
            Advanced dermatological analysis. Personalized insights. Clinical precision.
          </p>
          
          <button 
            onClick={handleStartScan}
            className="inline-flex items-center text-lg font-medium border-b-2 border-black pb-1 hover:border-gray-600 transition group"
          >
            Start your analysis
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* How It Works - 3 Steps */}
      <section className="py-32 px-8 border-t border-gray-200" id="technology">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-16 lg:gap-20">
            
            {/* Step 1 */}
            <div className="text-center">
              <div className="text-7xl font-light mb-8 text-black">01</div>
              <h3 className="text-2xl font-medium mb-4 text-black">Scan</h3>
              <p className="text-base text-gray-600 leading-relaxed font-light">
                Upload your image. AI analyzes over 200 dermatological markers in seconds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="text-7xl font-light mb-8 text-black">02</div>
              <h3 className="text-2xl font-medium mb-4 text-black">Analyze</h3>
              <p className="text-base text-gray-600 leading-relaxed font-light">
                Machine learning provides accurate skin health assessment.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="text-7xl font-light mb-8 text-black">03</div>
              <h3 className="text-2xl font-medium mb-4 text-black">Track</h3>
              <p className="text-base text-gray-600 leading-relaxed font-light">
                Receive personalized recommendations and track your progress.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 px-8 bg-gray-50 border-t border-gray-200" id="about">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-16 text-center">
            
            <div>
              <div className="text-6xl md:text-7xl font-light mb-4 text-black">95%</div>
              <div className="text-base text-gray-600 font-light">Clinical accuracy</div>
            </div>

            <div>
              <div className="text-6xl md:text-7xl font-light mb-4 text-black">50K+</div>
              <div className="text-base text-gray-600 font-light">Scans completed</div>
            </div>

            <div>
              <div className="text-6xl md:text-7xl font-light mb-4 text-black">&lt;60s</div>
              <div className="text-base text-gray-600 font-light">Analysis time</div>
            </div>

          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-8 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight mb-8 text-black">
            Begin your analysis
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-14 font-light">
            Clinical-grade skin health insights in under 60 seconds
          </p>
          <button 
            onClick={handleStartScan}
            className="inline-flex items-center text-lg font-medium border-b-2 border-black pb-1 hover:border-gray-600 transition group"
          >
            Get started
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0 mb-8">
            <div>
              <div className="text-lg font-medium mb-2">Twacha Labs</div>
              <div className="text-sm text-gray-400">Advanced dermatological analysis</div>
            </div>
            
            <div className="flex space-x-8 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition">
                Privacy
              </Link>
              <a href="/terms" className="text-gray-400 hover:text-white transition">
                Terms
              </a>
              <a href="/contact" className="text-gray-400 hover:text-white transition">
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
