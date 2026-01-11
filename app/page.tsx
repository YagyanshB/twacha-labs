'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import WaitlistForm from './components/WaitlistForm';
import { Camera, Scissors, Bandage, FileText, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  const handleWaitlistSubmit = async (email: string, consentGiven: boolean) => {
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, consent_given: consentGiven }),
      });

      if (response.ok) {
        setWaitlistSubmitted(true);
      }
    } catch (error) {
      console.error('Waitlist submission error:', error);
    }
  };

  const handleViewSampleReport = () => {
    window.location.href = '/analysis?sample=true';
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection onSubmit={handleWaitlistSubmit} waitlistSubmitted={waitlistSubmitted} />
      <ThreeStepProtocolSection />
      <NHSProofSection />
      <ProductShowcaseSection />
      <SampleReportSection onViewSample={handleViewSampleReport} />
      <Footer onSubmit={handleWaitlistSubmit} />
    </div>
  );
}

// Navigation
function Navbar() {
  return (
    <nav>
      <div className="nav-container">
        <a href="#" className="logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
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
          <ul className="nav-links">
            <li><a href="#protocol" onClick={(e) => { e.preventDefault(); document.getElementById('protocol')?.scrollIntoView({ behavior: 'smooth' }); }}>How it works</a></li>
            <li><a href="/pricing" onClick={(e) => { e.preventDefault(); window.location.href = '/pricing'; }}>Pricing</a></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

// Hero Section - Waitlist Engine
function HeroSection({ onSubmit, waitlistSubmitted }: { onSubmit: (email: string, consent: boolean) => void; waitlistSubmitted: boolean }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-sans tracking-tight">
            Professional Dermal Analysis.
            <span className="block mt-2">In Your Pocket.</span>
          </h1>
          <p className="text-lg text-slate-600 mt-4 max-w-2xl mx-auto font-sans">
            Twacha Labs uses 15x macro-imaging to decode men's skin. Join the Batch 001 Pilot—Shipping Feb 14th.
          </p>
        </motion.div>

        {!waitlistSubmitted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-8"
          >
            <WaitlistForm onSubmit={onSubmit} variant="hero" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg"
          >
            <p className="text-green-900 font-medium font-sans">✓ You're on the list! Check your email for confirmation.</p>
          </motion.div>
        )}

        {/* Product Shot Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-12 max-w-md mx-auto"
        >
          <div className="bg-slate-100 rounded-2xl p-8 border border-slate-200">
            <div className="aspect-[9/16] bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-sm text-slate-500 font-sans">15x Macro Lens</p>
              </div>
        </div>
      </div>
        </motion.div>

        {/* Live Status Ticker */}
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 pt-6 border-t border-slate-200"
        >
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-500">
            <span>[LAB_STATUS: BATCH_001_PREP]</span>
            <span>[LAUNCH_WINDOW: 14_FEB_2025]</span>
            <span>[SPOTS_REMAINING: 14]</span>
              </div>
            </motion.div>
      </div>
    </section>
  );
}

// Three-Step Protocol Section
function ThreeStepProtocolSection() {
  return (
    <section id="protocol" className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-4 font-sans tracking-tight">The Three-Step Protocol</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: 'THE LENS',
              title: 'Clip on the 15x Twacha Macro-Lens',
              description: 'Attach our precision macro lens to your phone camera for clinical-grade imaging.',
              icon: Camera,
            },
            {
              step: 'THE SCAN',
              title: 'AI decodes your dermal integrity in seconds',
              description: 'Our GPT-4o powered analysis identifies issues you cannot see with the naked eye.',
              icon: Camera,
            },
            {
              step: 'THE CURE',
              title: 'Deploy sterile tools and patches for 44-hour healing',
              description: 'Use precision lancets and hydrocolloid patches for professional-grade extraction and recovery.',
              icon: Bandage,
            },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2 font-sans">{item.title}</h3>
                <p className="text-sm text-slate-600 font-sans">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// NHS Triage Proof Section
function NHSProofSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4">
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-slate-50 rounded-lg p-8 border border-slate-200"
        >
          <div className="flex items-start gap-4 mb-4">
            <FileText className="w-6 h-6 text-slate-600 flex-shrink-0 mt-1" strokeWidth={1.5} />
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2 font-sans">GP-Ready Reports</h3>
              <p className="text-slate-600 font-sans leading-relaxed">
                Our AI doesn't just scan; it documents. Every analysis is exportable as a clinical PDF, designed to fast-track your NHS dermatology referrals if severe markers are detected.
              </p>
            </div>
          </div>
            </motion.div>
      </div>
    </section>
  );
}

// Product Showcase Section
function ProductShowcaseSection() {
  return (
    <section className="py-20 bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 font-sans tracking-tight">The Founder's Kit</h2>
          <p className="text-slate-400 font-sans">Join 100+ founding researchers. Get early access to the 15x Macro-AI suite and the Precision Dermal Kit.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            { icon: Camera, name: '15x Macro Lens', description: 'Clinical-grade imaging' },
            { icon: Scissors, name: 'Sterile Lancets', description: 'Precision extraction tools' },
            { icon: Bandage, name: 'Hydrocolloid Patches', description: '44-hour healing support' },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
            <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-slate-800 rounded-lg p-6 border border-slate-700"
              >
                <Icon className="w-8 h-8 text-slate-400 mb-4" strokeWidth={1.5} />
                <h3 className="text-lg font-semibold mb-2 font-sans">{item.name}</h3>
                <p className="text-sm text-slate-400 font-sans">{item.description}</p>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Sample Report Section
function SampleReportSection({ onViewSample }: { onViewSample: () => void }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-semibold text-slate-900 mb-4 font-sans tracking-tight">See What You'll Get</h2>
          <p className="text-slate-600 mb-8 font-sans">View a sample clinical report to see the quality of analysis you'll receive.</p>
          <button
            onClick={onViewSample}
            className="px-8 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors font-sans"
          >
            View Sample Report
          </button>
        </motion.div>
      </div>
    </section>
  );
}

// Footer with Waitlist Form
function Footer({ onSubmit }: { onSubmit: (email: string, consent: boolean) => void }) {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 font-sans">Join the Lab</h3>
            <p className="text-sm text-slate-600 mb-4 font-sans">
              The Future of Men's Skin. Shipping Feb 14th.
            </p>
            <WaitlistForm onSubmit={onSubmit} variant="footer" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 font-sans">Company</h3>
            <ul className="space-y-2 text-sm text-slate-600 font-sans">
              <li><a href="/privacy" className="hover:text-slate-900">Privacy</a></li>
              <li><a href="#" className="hover:text-slate-900">Terms</a></li>
              <li><a href="#" className="hover:text-slate-900">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500 font-sans">
            <a href="/privacy" className="underline hover:text-slate-700">How we protect your data</a>
          </p>
          <p className="text-xs text-slate-400 mt-2 font-sans">© 2025 Twacha Labs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
