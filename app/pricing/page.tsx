'use client';

import { Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '£0',
    description: 'Perfect for testing the waters.',
    cta: 'Start analysis',
    href: '/analysis',
    popular: false,
    features: [
      '1 analysis per month',
      'Basic acne detection',
      'General recommendations',
      'Educational content',
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
    <div className="min-h-screen bg-black text-white">
      {/* Simple Header */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="text-xl font-bold hover:text-white/80 transition">
            Twacha Labs
          </Link>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-32" id="pricing">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          {/* Minimal Header */}
          <div className="mx-auto max-w-2xl text-center mb-20">
            <h2 className="text-5xl font-light tracking-tight text-white sm:text-6xl font-serif">
              Simple pricing.
            </h2>
            <p className="mt-6 text-lg leading-8 text-zinc-400">
              No hidden fees. Cancel anytime.
            </p>
          </div>

          {/* Grid */}
          <div className="mx-auto grid max-w-lg grid-cols-1 gap-12 lg:max-w-none lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col rounded-3xl p-8 ring-1 transition-all duration-300 xl:p-10 ${
                  plan.popular
                    ? 'bg-zinc-900/50 ring-white/20 shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)]'
                    : 'bg-transparent ring-white/10 hover:ring-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className="text-lg font-semibold leading-8 text-white">
                    {plan.name}
                  </h3>
                  {plan.popular && (
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold leading-5 text-white">
                      Most popular
                    </span>
                  )}
                </div>
                
                <p className="mt-4 text-sm leading-6 text-zinc-400">
                  {plan.description}
                </p>
                
                <div className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-5xl font-light tracking-tight text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm font-semibold leading-6 text-zinc-500">
                      {plan.period}
                    </span>
                  )}
                </div>

                <Link
                  href={plan.href}
                  className={`mt-8 block rounded-md px-3 py-2.5 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition ${
                    plan.popular
                      ? 'bg-white text-black hover:bg-zinc-200 focus-visible:outline-white'
                      : 'bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white'
                  }`}
                >
                  {plan.cta}
                </Link>

                {/* List pushes to bottom to align buttons */}
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-zinc-300 xl:mt-10 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check className="h-6 w-5 flex-none text-white" aria-hidden="true" />
                      <span className="text-zinc-400">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {plan.subtext && (
                  <p className="mt-4 text-xs text-zinc-500 text-center">{plan.subtext}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ - Minimal */}
      <section className="border-t border-white/10 py-32">
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
      <section className="border-t border-white/10 py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">
            Ready to start?
          </h2>
          <p className="text-lg sm:text-xl text-white/60 mb-12">
            Join 100K+ men taking control of their skin
          </p>
          <Link
            href="/analysis"
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition text-lg"
          >
            Start free analysis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 text-sm text-white/40">
            <div>© 2026 Twacha Labs</div>
            <div className="flex gap-8">
              <Link href="/privacy" className="hover:text-white/80 transition">Privacy</Link>
              <Link href="/terms" className="hover:text-white/80 transition">Terms</Link>
              <Link href="/contact" className="hover:text-white/80 transition">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">{question}</h3>
      <p className="text-white/60 leading-relaxed">{answer}</p>
    </div>
  );
}
