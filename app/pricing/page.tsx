'use client';

import { Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Simple Header */}
      <header className="border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="text-xl font-bold hover:text-zinc-300 transition">
            Twacha Labs
          </Link>
        </div>
      </header>

      {/* Hero Section - More Spacious */}
      <section className="pt-20 pb-16 sm:pt-32 sm:pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            Simple pricing
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto">
            Start free. Upgrade when you need more. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing Cards - Clean Grid */}
      <section className="pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Free Tier */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-8 flex flex-col">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-bold">£0</span>
                </div>
                <Link
                  href="/analysis"
                  className="block w-full bg-zinc-900 text-white py-3 rounded-lg font-medium text-center hover:bg-zinc-800 transition"
                >
                  Start free
                </Link>
              </div>
              
              <ul className="space-y-4 flex-1">
                <Feature>1 analysis per month</Feature>
                <Feature>Basic acne detection</Feature>
                <Feature>General recommendations</Feature>
                <Feature>Educational content</Feature>
              </ul>
            </div>

            {/* Premium Tier */}
            <div className="bg-white text-black rounded-lg p-8 flex flex-col relative border-2 border-white">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-zinc-900 text-white px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                  Most Popular
                </span>
              </div>
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-bold">£4.99</span>
                  <span className="text-zinc-600">/month</span>
                </div>
                <p className="text-sm text-zinc-600 mb-6">or £49/year (save 17%)</p>
                <Link
                  href="/checkout?plan=premium"
                  className="block w-full bg-black text-white py-3 rounded-lg font-medium text-center hover:bg-zinc-800 transition"
                >
                  Go premium
                </Link>
              </div>
              
              <ul className="space-y-4 flex-1">
                <Feature dark>Unlimited analyses</Feature>
                <Feature dark>Advanced skin analysis</Feature>
                <Feature dark>Progress tracking</Feature>
                <Feature dark>Personalized routines</Feature>
                <Feature dark>Product recommendations</Feature>
                <Feature dark>Priority support</Feature>
              </ul>
            </div>

            {/* One-Time */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-8 flex flex-col">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">Premium Report</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-bold">£9.99</span>
                  <span className="text-zinc-600">/once</span>
                </div>
                <Link
                  href="/checkout?plan=onetime"
                  className="block w-full bg-zinc-900 text-white py-3 rounded-lg font-medium text-center hover:bg-zinc-800 transition"
                >
                  Get report
                </Link>
              </div>
              
              <ul className="space-y-4 flex-1">
                <Feature>Full detailed analysis</Feature>
                <Feature>Comprehensive report</Feature>
                <Feature>Valid for 7 days</Feature>
                <Feature>All premium features</Feature>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ - Minimal */}
      <section className="border-t border-zinc-900 py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-16 text-center">
            Questions
          </h2>
          
          <div className="space-y-12">
            <FAQItem
              question="Can I really use it for free?"
              answer="Yes. Get 1 free analysis per month with basic recommendations. No credit card required."
            />
            <FAQItem
              question="What's included in Premium?"
              answer="Unlimited analyses, advanced skin analysis (texture, pores, aging), progress tracking, personalized routines, and priority support."
            />
            <FAQItem
              question="Can I cancel anytime?"
              answer="Absolutely. Cancel with one click. No questions asked."
            />
            <FAQItem
              question="Is my facial data secure?"
              answer="Yes. Bank-level encryption. Your photos are never shared or sold. Delete your account anytime."
            />
          </div>
        </div>
      </section>

      {/* Final CTA - Clean */}
      <section className="border-t border-zinc-900 py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">
            Ready to start?
          </h2>
          <p className="text-lg sm:text-xl text-zinc-400 mb-12">
            Join 100K+ men taking control of their skin
          </p>
          <Link
            href="/analysis"
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-zinc-100 transition text-lg"
          >
            Start free analysis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 text-sm text-zinc-600">
            <div>© 2026 Twacha Labs</div>
            <div className="flex gap-8">
              <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition">Terms</Link>
              <Link href="/contact" className="hover:text-white transition">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <li className="flex items-start gap-3">
      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${dark ? 'text-black' : 'text-zinc-500'}`} />
      <span className={`text-sm ${dark ? 'text-zinc-700' : 'text-zinc-400'}`}>
        {children}
      </span>
    </li>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">{question}</h3>
      <p className="text-zinc-400 leading-relaxed">{answer}</p>
    </div>
  );
}
