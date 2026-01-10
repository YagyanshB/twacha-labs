import React from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '£0',
      description: 'Perfect for testing the waters.',
      cta: 'Start free analysis',
      popular: false,
      features: [
        '1 analysis per month',
        'Basic acne detection',
        'General recommendations',
      ],
    },
    {
      name: 'Premium',
      price: '£4.99',
      period: '/mo',
      description: 'For serious skin progress.',
      cta: 'Go Premium',
      popular: true, // This one will be Black to match your branding
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
      popular: false,
      features: [
        'Full comprehensive report',
        'Downloadable PDF',
        'Shareable with dermatologists',
        'Valid for 7 days',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-black selection:text-white">
      
      {/* Simple Header */}
      <header className="border-b border-zinc-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <Link href="/" className="text-xl font-bold tracking-tight">Twacha Labs</Link>
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-black">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </header>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          {/* Headline */}
          <div className="mx-auto max-w-2xl text-center mb-20">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
              Simple pricing
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-500">
              Start free. Upgrade when you're ready to commit.
            </p>
          </div>

          {/* Grid */}
          <div className="mx-auto grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col rounded-3xl p-8 transition-all duration-300 ${
                  plan.popular
                    ? 'bg-black text-white shadow-2xl ring-1 ring-black'
                    : 'bg-white text-zinc-900 ring-1 ring-zinc-200 hover:ring-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className={`text-lg font-semibold leading-8 ${plan.popular ? 'text-white' : 'text-zinc-900'}`}>
                    {plan.name}
                  </h3>
                  {plan.popular && (
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold leading-5 text-black">
                      POPULAR
                    </span>
                  )}
                </div>
                
                <p className={`mt-4 text-sm leading-6 ${plan.popular ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {plan.description}
                </p>
                
                <div className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-5xl font-bold tracking-tight">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-sm font-semibold leading-6 ${plan.popular ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {plan.period}
                    </span>
                  )}
                </div>

                <a
                  href="#"
                  className={`mt-8 block rounded-full px-3 py-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    plan.popular
                      ? 'bg-white text-black hover:bg-zinc-200'
                      : 'bg-black text-white hover:bg-zinc-800'
                  }`}
                >
                  {plan.cta}
                </a>

                <ul role="list" className={`mt-8 space-y-3 text-sm leading-6 xl:mt-10 ${plan.popular ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check className={`h-6 w-5 flex-none ${plan.popular ? 'text-white' : 'text-black'}`} aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}