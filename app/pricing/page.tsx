'use client';

import { Check, ArrowRight, Zap, TrendingUp, Shield } from 'lucide-react';
import Link from 'next/link';
import { PRICING_TIERS } from '@/lib/pricing';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/" className="text-xl font-bold">
            Twacha Labs
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            Start free. Upgrade when you're ready. No hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Tier */}
            <PricingCard
              tier={PRICING_TIERS.free}
              cta="Start free"
              href="/analysis"
              icon={Zap}
            />

            {/* Premium Tier - Featured */}
            <PricingCard
              tier={PRICING_TIERS.premium}
              cta="Go premium"
              href="/checkout?plan=premium"
              featured
              icon={TrendingUp}
              badge="Most Popular"
            />

            {/* One-Time */}
            <PricingCard
              tier={PRICING_TIERS.oneTime}
              cta="Get report"
              href="/checkout?plan=onetime"
              icon={Shield}
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-zinc-900 border-y border-zinc-800">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Frequently asked questions
          </h2>
          
          <div className="space-y-8">
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
              answer="Absolutely. Cancel with one click. No questions asked. Your data stays safe."
            />
            <FAQItem
              question="Is my facial data secure?"
              answer="Yes. We use bank-level encryption. Your photos are never shared or sold. Delete your account anytime."
            />
            <FAQItem
              question="Do you sell products?"
              answer="Not yet. We focus purely on analysis and recommendations. We may link to products but earn no commission (for now)."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to level up your skin?
          </h2>
          <p className="text-xl text-zinc-400 mb-8">
            Join 100K+ men taking control of their skin health
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
    </div>
  );
}

function PricingCard({ 
  tier, 
  cta, 
  href, 
  featured = false, 
  icon: Icon,
  badge 
}: { 
  tier: typeof PRICING_TIERS.free | typeof PRICING_TIERS.premium | typeof PRICING_TIERS.oneTime;
  cta: string;
  href: string;
  featured?: boolean;
  icon: any;
  badge?: string;
}) {
  return (
    <div className={`relative rounded-2xl p-8 ${
      featured 
        ? 'bg-white text-black border-4 border-white' 
        : 'bg-zinc-900 border-2 border-zinc-800'
    }`}>
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-white text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            {badge}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <Icon className={`w-6 h-6 ${featured ? 'text-black' : 'text-zinc-400'}`} />
        <h3 className="text-2xl font-bold">{tier.name}</h3>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold">{tier.currency}{tier.price}</span>
          {tier.interval && (
            <span className={featured ? 'text-zinc-700' : 'text-zinc-500'}>
              /{tier.interval}
            </span>
          )}
        </div>
        {tier.yearlyPrice && (
          <p className={`text-sm mt-2 ${featured ? 'text-zinc-700' : 'text-zinc-500'}`}>
            or {tier.currency}{tier.yearlyPrice}/year (save 17%)
          </p>
        )}
      </div>

      <Link
        href={href}
        className={`block w-full py-3 rounded-lg font-semibold text-center mb-6 transition-all duration-200 ${
          featured
            ? 'bg-black text-white hover:bg-zinc-800'
            : 'bg-white text-black hover:bg-zinc-100'
        }`}
      >
        {cta}
      </Link>

      <ul className="space-y-3">
        {tier.features.map((feature: string, i: number) => (
          <li key={i} className="flex items-start gap-3">
            <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              featured ? 'text-black' : 'text-zinc-400'
            }`} />
            <span className={featured ? 'text-zinc-700' : 'text-zinc-400'}>
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </div>
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
