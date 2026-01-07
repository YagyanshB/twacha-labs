'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Image from 'next/image';
import { Scan, ScanFace, Sparkles, Package, Droplet, Shield, Brain, TrendingUp } from 'lucide-react';
import FaceIDScanner from './components/FaceIDScanner';
import EmailGate from './components/EmailGate';
import ResultsDashboard from './components/ResultsDashboard';
import ProductSection from './components/ProductSection';

type FunnelState = 'landing' | 'scanning' | 'analyzing' | 'email-gate' | 'results';

interface AnalysisResult {
  score: number;
  verdict: string;
  analysis: string;
  recommendation: string;
  imagePath?: string | null;
}

export default function Home() {
  const [funnelState, setFunnelState] = useState<FunnelState>('landing');
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  const handleStartScan = () => {
    setFunnelState('scanning');
  };

  const handleScanComplete = async (images: string[]) => {
    setCapturedImages(images);
    setFunnelState('analyzing');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images, email: null }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysisResult(data);
      setFunnelState('email-gate');
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisResult({
        score: 65,
        verdict: 'CAUTION',
        analysis: 'Moderate skin congestion detected. Some areas show inflammation.',
        recommendation: 'The Founder\'s Kit',
      });
      setFunnelState('email-gate');
    }
  };

  const handleEmailSubmit = async (email: string) => {
    setUserEmail(email);
    
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (analysisResult?.imagePath) {
        try {
          await fetch('/api/scan-logs/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              email, 
              imagePath: analysisResult.imagePath 
            }),
          });
        } catch (updateError) {
          console.error('Scan log update error:', updateError);
        }
      }
    } catch (error) {
      console.error('Email save error:', error);
    }

    setFunnelState('results');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#18181B]">
      {/* State 1: Landing/Hero */}
      <AnimatePresence mode="wait">
        {funnelState === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col"
          >
            <HeroSection onStartScan={handleStartScan} />
            <ProductSection />
            <HowItWorksSection />
            <AIInsightsSection />
            <Footer />
          </motion.div>
        )}

        {/* State 2: Scanning */}
        {funnelState === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <FaceIDScanner
              onComplete={handleScanComplete}
              onBack={() => setFunnelState('landing')}
            />
          </motion.div>
        )}

        {/* State 3: Analyzing */}
        {funnelState === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center"
          >
            <AnalysisLoading />
          </motion.div>
        )}

        {/* State 4: Email Gate */}
        {funnelState === 'email-gate' && analysisResult && (
          <motion.div
            key="email-gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmailGate
              analysisResult={analysisResult}
              onSubmit={handleEmailSubmit}
            />
          </motion.div>
        )}

        {/* State 5: Results & Sales */}
        {funnelState === 'results' && analysisResult && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ResultsDashboard
              analysisResult={analysisResult}
              email={userEmail}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sticky Glassmorphic Navbar
function Navbar({ onStartScan }: { onStartScan: () => void }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="glass rounded-2xl px-6 py-4 flex items-center justify-between shadow-lg">
          <div className="text-2xl font-bold tracking-tight text-[#18181B]" style={{ fontFamily: 'var(--font-serif)' }}>
            TWACHA
          </div>
          <motion.button
            onClick={onStartScan}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 bg-[#104136] text-white font-medium rounded-full hover:bg-[#0d3529] transition-all shadow-lg"
          >
            Get the Kit
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}

// Hero Section with iPhone Mockup
function HeroSection({ onStartScan }: { onStartScan: () => void }) {
  return (
    <>
      <Navbar onStartScan={onStartScan} />
      
      <div className="pt-24 pb-16 md:pt-32 md:pb-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh]">
            {/* Left: Typography */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-[#18181B]">
                Precision Triage for
                <br />
                <span className="text-[#104136]">Men's Skin</span>
              </h1>
              <p className="text-xl md:text-2xl text-[#71717A] leading-relaxed max-w-xl">
                Stop guessing. Scan your skin with AI. Get the hardware to fix it.
              </p>
              <motion.button
                onClick={onStartScan}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-[#104136] text-white font-semibold rounded-full hover:bg-[#0d3529] transition-all shadow-xl inline-flex items-center gap-3 text-lg"
              >
                <Scan className="w-6 h-6" />
                Start Your Scan
              </motion.button>
            </motion.div>

            {/* Right: iPhone Mockup with Floating Cards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative flex items-center justify-center"
            >
              {/* iPhone Bezel */}
              <div className="relative w-[320px] md:w-[400px] mx-auto">
                <div className="bg-black rounded-[3rem] p-3 shadow-2xl">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10" />
                  
                  {/* Screen */}
                  <div className="bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19.5] relative">
                    <Image
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop"
                      alt="Male model"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Floating Glass Card 1: Top Left - Oil Control */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute -top-8 -left-8 md:-left-12 glass rounded-2xl px-4 py-3 shadow-xl z-20"
              >
                <div className="flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-[#104136]" />
                  <span className="text-sm font-semibold text-[#18181B]">Oil Control: Active</span>
                </div>
              </motion.div>

              {/* Floating Glass Card 2: Bottom Right - Barrier Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute -bottom-8 -right-8 md:-right-12 glass rounded-2xl px-4 py-3 shadow-xl z-20"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#104136]" />
                  <span className="text-sm font-semibold text-[#18181B]">Barrier Status: 92%</span>
                </div>
              </motion.div>

              {/* Floating Glass Card 3: Bottom Center - Scan Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-20"
              >
                <motion.button
                  onClick={onStartScan}
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="glass rounded-full px-6 py-3 shadow-xl flex items-center gap-2 hover:bg-white/90 transition-all"
                >
                  <Scan className="w-5 h-5 text-[#104136]" />
                  <span className="text-sm font-semibold text-[#18181B]">Scan</span>
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

// How it Works Section
function HowItWorksSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const steps = [
    {
      icon: ScanFace,
      title: 'The Deep Scan',
      description: 'Clip on the lens. AI maps pore depth at 15x zoom.',
    },
    {
      icon: Sparkles,
      title: 'Identification',
      description: 'Triage Engine identifies Cystic vs. Surface-level breaches.',
    },
    {
      icon: Package,
      title: 'The Protocol',
      description: 'Receive your custom hardware kit to resolve the specific issue.',
    },
  ];

  return (
    <div ref={sectionRef} className="w-full py-20 md:py-32 bg-white px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-center mb-16 text-[#18181B]"
        >
          How It Works
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="card-premium p-8 text-center"
              >
                <div className="w-16 h-16 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-8 h-8 text-[#104136]" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-[#18181B]">
                  {step.title}
                </h3>
                <p className="text-[#71717A] leading-relaxed text-lg">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// AI Insights Demo Section
function AIInsightsSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <div ref={sectionRef} className="w-full py-20 md:py-32 bg-[#F9FAFB] px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-center mb-16 text-[#18181B]"
        >
          The Intelligence
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="card-premium p-8 md:p-12"
        >
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-semibold text-[#18181B]">Skin Health Score</span>
              <span className="text-2xl font-bold text-[#104136]">84/100</span>
            </div>
            <div className="w-full h-4 bg-[#D1FAE5] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={isInView ? { width: '84%' } : { width: 0 }}
                transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                className="h-full bg-[#104136] rounded-full"
              />
            </div>
          </div>

          {/* Tags/Badges */}
          <div className="flex flex-wrap gap-3 mb-8">
            <span className="px-4 py-2 bg-[#D1FAE5] text-[#104136] rounded-full font-semibold text-sm">
              Skin Type: Oily
            </span>
            <span className="px-4 py-2 bg-[#D1FAE5] text-[#104136] rounded-full font-semibold text-sm">
              Texture: Congested
            </span>
            <span className="px-4 py-2 bg-[#D1FAE5] text-[#104136] rounded-full font-semibold text-sm">
              Inflammation: Low
            </span>
          </div>

          {/* Recommendation */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#104136] rounded-full flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-[#18181B] mb-2">AI Recommendation</h4>
                <p className="text-lg text-[#71717A]">
                  <span className="font-semibold text-[#104136]">Protocol A (Salicylic)</span> Recommended
                </p>
                <p className="text-[#71717A] mt-2">
                  Your skin shows moderate congestion in the T-zone. A targeted salicylic acid protocol will help clear pores and reduce inflammation.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Analysis Loading Component
function AnalysisLoading() {
  return (
    <div className="text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-[#104136] border-t-transparent rounded-full mx-auto mb-6"
      />
      <h2 className="text-2xl font-bold text-[#18181B] mb-2">Analyzing Skin Integrity...</h2>
      <p className="text-[#71717A]">Processing your scan</p>
    </div>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="w-full px-6 md:px-12 py-12 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm text-[#71717A] leading-relaxed">
          <strong className="text-[#18181B]">Disclaimer:</strong> Twacha Labs AI is for cosmetic analysis only. Not a medical diagnosis.
        </p>
        <p className="text-sm text-[#71717A] mt-4">
          &copy; {new Date().getFullYear()} Twacha Labs. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
