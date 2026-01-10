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
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight">Twacha Labs</Link>
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-black">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </header>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          {/* Headlines */}
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
              Simple pricing
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-500">
              Start free. Upgrade when you're ready to commit.
            </p>
          </div>

          {/* Pricing Grid */}
          {/* Added 'items-start' to ensure cards don't stretch weirdly if content differs */}
          <div className="mx-auto grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3 lg:items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-3xl p-8 transition-all duration-300 ${
                  plan.popular
                    ? 'z-10 -mt-4 mb-4 bg-black text-white shadow-2xl ring-1 ring-black lg:scale-105'
                    : 'bg-white text-zinc-900 ring-1 ring-zinc-200 hover:ring-zinc-300 hover:shadow-lg'
                }`}
              >
                {/* Fixed Badge: Floating Top Center */}
                {plan.popular && (
                  <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-zinc-800 px-3 py-1.5 text-center text-xs font-bold uppercase tracking-wider text-white shadow-md ring-4 ring-white">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-lg font-semibold leading-8 ${plan.popular ? 'text-white' : 'text-zinc-900'}`}>
                    {plan.name}
                  </h3>
                  
                  <p className={`mt-2 text-sm leading-6 ${plan.popular ? 'text-zinc-400' : 'text-zinc-500'}`}>
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
                </div>

                {/* Button pushed to bottom of top section, before list */}
                <a
                  href="#"
                  className={`mb-8 block w-full rounded-full px-3 py-3 text-center text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    plan.popular
                      ? 'bg-white text-black hover:bg-zinc-200'
                      : 'bg-black text-white hover:bg-zinc-800'
                  }`}
                >
                  {plan.cta}
                </a>

                {/* Feature List */}
                <ul role="list" className={`space-y-3 text-sm leading-6 ${plan.popular ? 'text-zinc-300' : 'text-zinc-600'}`}>
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