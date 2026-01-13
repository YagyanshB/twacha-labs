'use client'

import { ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <a href="/" className="text-base font-medium tracking-tight">
              Twacha Labs
            </a>
            
            <div className="hidden md:flex items-center space-x-8 text-sm">
              <a href="#how" className="text-gray-600 hover:text-black transition-colors">
                How it works
              </a>
              <a href="/pricing" className="text-gray-600 hover:text-black transition-colors">
                Pricing
              </a>
              <a href="/analysis" className="text-black font-medium hover:opacity-70 transition-opacity">
                Start free →
              </a>
            </div>

            {/* Mobile menu button - implement later */}
            <button className="md:hidden text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full height, centered */}
      <main>
        <section className="min-h-screen flex items-center justify-center px-6 pt-20">
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-[4rem] sm:text-[5rem] md:text-[6rem] lg:text-[8rem] font-light tracking-tight leading-[0.9] mb-12">
              Your skin
              <br />
              <span className="font-normal">decoded</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 font-light leading-relaxed mb-16 max-w-3xl mx-auto">
              Advanced dermatological analysis. Personalized insights. Clinical precision.
            </p>
            
            <a 
              href="/analysis"
              className="inline-flex items-center text-lg font-medium border-b-2 border-black pb-1 hover:border-gray-500 transition-colors group"
            >
              Start your analysis
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </section>

        {/* How it works - Simple 3 column */}
        <section id="how" className="py-24 sm:py-32 px-6 border-t border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12 lg:gap-20">
              
              <div className="text-center">
                <div className="text-6xl sm:text-7xl font-light mb-8">01</div>
                <h3 className="text-xl font-medium mb-4">Scan</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Upload your image. AI analyzes over 200 dermatological markers in seconds.
                </p>
              </div>

              <div className="text-center">
                <div className="text-6xl sm:text-7xl font-light mb-8">02</div>
                <h3 className="text-xl font-medium mb-4">Analyze</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Machine learning trained on clinical data provides accurate assessment.
                </p>
              </div>

              <div className="text-center">
                <div className="text-6xl sm:text-7xl font-light mb-8">03</div>
                <h3 className="text-xl font-medium mb-4">Track</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Receive personalized recommendations and track your skin health journey.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Stats - Gray background */}
        <section className="py-24 sm:py-32 px-6 bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12 text-center">
              
              <div>
                <div className="text-5xl sm:text-6xl md:text-7xl font-light mb-4">95%</div>
                <div className="text-gray-600 font-light">Clinical accuracy</div>
              </div>

              <div>
                <div className="text-5xl sm:text-6xl md:text-7xl font-light mb-4">50K+</div>
                <div className="text-gray-600 font-light">Scans completed</div>
              </div>

              <div>
                <div className="text-5xl sm:text-6xl md:text-7xl font-light mb-4">&lt;60s</div>
                <div className="text-gray-600 font-light">Analysis time</div>
              </div>

            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 sm:py-32 px-6 border-t border-gray-200">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight mb-8">
              Begin your analysis
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 font-light mb-16">
              Clinical-grade skin health insights in under 60 seconds
            </p>
            <a 
              href="/analysis"
              className="inline-flex items-center text-lg font-medium border-b-2 border-black pb-1 hover:border-gray-500 transition-colors group"
            >
              Get started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </section>
      </main>

      {/* Footer - Black */}
      <footer className="bg-black text-white px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-8 md:space-y-0 mb-8">
            <div>
              <div className="font-medium mb-2">Twacha Labs</div>
              <div className="text-sm text-gray-400">Advanced dermatological analysis</div>
            </div>
            
            <div className="flex space-x-8 text-sm">
              <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">
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
