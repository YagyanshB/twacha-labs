'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Image from 'next/image';
import { Scan, ScanFace, Sparkles, Package, Droplet, Shield, Brain, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';
import FaceIDScanner from './components/FaceIDScanner';
import EmailGate from './components/EmailGate';
import ResultsDashboard from './components/ResultsDashboard';
import ProductSection from './components/ProductSection';
import ProductModal from './components/ProductModal';

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
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

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
    <div className="min-h-screen bg-white text-[#0A0A0A]">
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
            <Navbar onOpenModal={() => setIsProductModalOpen(true)} />
            <HeroSection onStartScan={handleStartScan} onOpenModal={() => setIsProductModalOpen(true)} />
            <ProductShowcaseSection onOpenModal={() => setIsProductModalOpen(true)} />
            <HowItWorksSection />
            <AIDashboardSection />
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
            className="min-h-screen flex items-center justify-center bg-white"
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

      {/* Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />
    </div>
  );
}

// Navigation Bar
function Navbar({ onOpenModal }: { onOpenModal: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-black tracking-tight text-[#0A0A0A]">
            TWACHA
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium text-[#52525B] hover:text-[#0A0A0A] transition-colors">
              How It Works
            </a>
            <a href="#technology" className="text-sm font-medium text-[#52525B] hover:text-[#0A0A0A] transition-colors">
              Technology
            </a>
            <a href="#breach-kit" className="text-sm font-medium text-[#52525B] hover:text-[#0A0A0A] transition-colors">
              The Kit
            </a>
            <motion.button
              onClick={onOpenModal}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-[#FF3B30] text-white font-semibold rounded-lg hover:shadow-lg transition-all text-sm"
            >
              Get the Kit
            </motion.button>
          </div>
          <motion.button
            onClick={onOpenModal}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="md:hidden px-4 py-2 bg-[#FF3B30] text-white font-semibold rounded-lg text-sm"
          >
            Get Kit
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}

// Hero Section
function HeroSection({ onStartScan, onOpenModal }: { onStartScan: () => void; onOpenModal: () => void }) {
  return (
    <section className="min-h-screen flex items-center pt-24 pb-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] text-[#0A0A0A] tracking-tight">
              Precision<br />
              <span className="bg-gradient-to-r from-[#FF3B30] to-[#FF6B60] bg-clip-text text-transparent">
                Skin Intelligence
              </span>
              <br />
              for Men
            </h1>
            <p className="text-xl md:text-2xl text-[#52525B] leading-relaxed max-w-xl">
              Military-grade AI diagnostics. Clinical hardware delivery. 
              Stop guessing what your skin needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                onClick={onStartScan}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-[#FF3B30] text-white font-semibold rounded-xl hover:shadow-xl transition-all inline-flex items-center justify-center gap-2 text-lg"
              >
                Start Deep Scan
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={onOpenModal}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-white border-2 border-[#E5E7EB] text-[#0A0A0A] font-semibold rounded-xl hover:border-[#0A0A0A] transition-all text-lg"
              >
                View Demo
              </motion.button>
            </div>
            <div className="flex flex-wrap gap-8 pt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#0A0A0A]">15x</span>
                <span className="text-sm text-[#52525B]">Magnification</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#0A0A0A]">0.3s</span>
                <span className="text-sm text-[#52525B]">Analysis Time</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#0A0A0A]">94%</span>
                <span className="text-sm text-[#52525B]">Accuracy</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Scanner Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full h-[600px] bg-[#F9FAFB] rounded-3xl border border-[#E5E7EB] overflow-hidden">
              {/* Scanner UI */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [1, 0.8, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-[300px] h-[300px] border-2 border-[#FF3B30] rounded-full"
                />
              </div>

              {/* Scan Data Cards */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl border border-[#E5E7EB] shadow-lg"
              >
                <div className="text-xs font-medium text-[#52525B] mb-1">BARRIER STATUS</div>
                <div className="text-2xl font-bold text-[#34C759]">92%</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl border border-[#E5E7EB] shadow-lg"
              >
                <div className="text-xs font-medium text-[#52525B] mb-1">OIL CONTROL</div>
                <div className="text-2xl font-bold text-[#0A0A0A]">ACTIVE</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Product Showcase Section
function ProductShowcaseSection({ onOpenModal }: { onOpenModal: () => void }) {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section id="breach-kit" ref={sectionRef} className="py-20 md:py-32 bg-[#F9FAFB] border-t border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-2 bg-[#FF3B30]/10 border border-[#FF3B30]/30 rounded-full text-xs font-semibold text-[#FF3B30] mb-4">
            FOUNDER'S EDITION
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-[#0A0A0A]">The Breach Kit</h2>
          <p className="text-xl text-[#52525B]">
            Clinical-grade hardware engineered to neutralize skin threats before they surface.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Product Image */}
          <div className="relative bg-gradient-to-br from-[#F9FAFB] to-white rounded-3xl p-8 border border-[#E5E7EB]">
            <div className="relative aspect-square">
              <Image
                src="/breach-kit.png"
                alt="The Breach Kit"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <h3 className="text-4xl font-black text-[#0A0A0A]">Complete Tactical Protocol</h3>
            <div className="text-5xl font-black text-[#FF3B30]">£24</div>
            
            <ul className="space-y-4">
              {[
                { name: 'Universal 15x Macro Lens', qty: '1x' },
                { name: 'Hydrocolloid Patches (Matte)', qty: '30x' },
                { name: 'Sterile Precision Lancets', qty: '10x' },
                { name: 'Medical-Grade Alcohol Pads', qty: '10x' },
                { name: 'Matte Black Tactical Carry Tin', qty: '1x' },
              ].map((item, idx) => (
                <li key={idx} className="flex justify-between items-center py-3 border-b border-[#E5E7EB]">
                  <span className="text-[#0A0A0A] font-medium">{item.name}</span>
                  <span className="text-[#52525B] text-sm">{item.qty}</span>
                </li>
              ))}
            </ul>

            <motion.button
              onClick={onOpenModal}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-8 py-4 bg-[#FF3B30] text-white font-semibold rounded-xl hover:shadow-xl transition-all text-lg"
            >
              Secure Your Kit
            </motion.button>

            <div className="flex flex-wrap justify-between gap-4 text-sm text-[#52525B] pt-4">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                Next Day Dispatch
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                30-Day Guarantee
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                Free Shipping
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const steps = [
    {
      number: '1',
      icon: ScanFace,
      title: 'Deep Scan',
      description: 'Clip on the tactical lens. Our AI maps pore depth and skin topology at 15x magnification with military precision.',
    },
    {
      number: '2',
      icon: Sparkles,
      title: 'Threat Assessment',
      description: 'Triage Engine identifies threats: Cystic formations, surface breaches, bacterial hotspots. Real-time classification.',
    },
    {
      number: '3',
      icon: Package,
      title: 'Rapid Response',
      description: 'Receive your precision hardware protocol. Clinical-grade tools matched to your specific threat profile.',
    },
  ];

  return (
    <section id="how-it-works" ref={sectionRef} className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-[#0A0A0A]">Precision Protocol</h2>
          <p className="text-xl text-[#52525B]">
            Three steps between you and optimal skin performance.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="relative bg-white border-2 border-[#E5E7EB] rounded-2xl p-8 hover:border-[#FF3B30] hover:shadow-xl transition-all"
              >
                <div className="absolute -top-5 left-8 w-10 h-10 bg-[#FF3B30] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {step.number}
                </div>
                <div className="w-16 h-16 bg-[#FF3B30]/10 rounded-xl flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8 text-[#FF3B30]" />
                </div>
                <h4 className="text-2xl font-bold mb-4 text-[#0A0A0A]">{step.title}</h4>
                <p className="text-[#52525B] leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// AI Dashboard Section
function AIDashboardSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section id="technology" ref={sectionRef} className="py-20 md:py-32 bg-[#F9FAFB] border-t border-[#E5E7EB]">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-[#0A0A0A]">Intelligence Dashboard</h2>
          <p className="text-xl text-[#52525B]">
            Real-time skin analytics powered by our proprietary Triage Engine.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white border border-[#E5E7EB] rounded-3xl p-8 md:p-12 shadow-xl"
        >
          {/* Health Score */}
          <div className="flex justify-center mb-12">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#34C759"
                  strokeWidth="8"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={isInView ? { pathLength: 0.84 } : { pathLength: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : { scale: 0 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="text-4xl font-black text-[#0A0A0A]"
                >
                  84
                </motion.span>
                <span className="text-xs text-[#52525B] font-medium">HEALTH SCORE</span>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { label: 'SKIN TYPE', value: 'Oily / Combination', colorClass: 'text-[#0A0A0A]' },
              { label: 'TEXTURE ANALYSIS', value: 'Moderate Congestion', colorClass: 'text-[#0A0A0A]' },
              { label: 'INFLAMMATION', value: 'Low Risk', colorClass: 'text-[#34C759]' },
            ].map((metric, idx) => (
              <div key={idx} className="bg-[#F9FAFB] p-6 rounded-xl border border-[#E5E7EB]">
                <div className="text-xs font-medium text-[#52525B] mb-2">{metric.label}</div>
                <div className={`text-lg font-bold ${metric.colorClass}`}>
                  {metric.value}
                </div>
              </div>
            ))}
          </div>

          {/* AI Recommendation */}
          <div className="bg-gradient-to-br from-[#FF3B30]/10 to-[#FF3B30]/5 border border-[#FF3B30]/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-[#FF3B30] text-white rounded-full text-xs font-semibold">
                AI RECOMMENDATION
              </span>
              <h4 className="text-xl font-bold text-[#0A0A0A]">Protocol A: Salicylic Defense</h4>
            </div>
            <p className="text-[#52525B] leading-relaxed">
              Your skin shows moderate congestion in the T-zone with early-stage comedone formation. 
              Recommended: Targeted salicylic acid protocol with hydrocolloid extraction for optimal clearing.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Analysis Loading Component
function AnalysisLoading() {
  return (
    <div className="text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-[#FF3B30] border-t-transparent rounded-full mx-auto mb-6"
      />
      <h2 className="text-2xl font-bold text-[#0A0A0A] mb-2">Analyzing Skin Integrity...</h2>
      <p className="text-[#52525B]">Processing your scan</p>
    </div>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="w-full px-6 md:px-12 py-12 bg-white border-t border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-center gap-8 mb-8">
          <a href="#" className="text-sm text-[#52525B] hover:text-[#0A0A0A] transition-colors">Privacy Policy</a>
          <a href="#" className="text-sm text-[#52525B] hover:text-[#0A0A0A] transition-colors">Terms of Service</a>
          <a href="#" className="text-sm text-[#52525B] hover:text-[#0A0A0A] transition-colors">Clinical Studies</a>
          <a href="#" className="text-sm text-[#52525B] hover:text-[#0A0A0A] transition-colors">Support</a>
          <a href="#" className="text-sm text-[#52525B] hover:text-[#0A0A0A] transition-colors">Contact</a>
        </div>
        <div className="bg-[#F9FAFB] rounded-xl p-6 max-w-2xl mx-auto mb-6">
          <p className="text-xs text-[#52525B] leading-relaxed text-center">
            <strong className="text-[#0A0A0A]">Medical Disclaimer:</strong> Twacha Labs AI is designed for cosmetic skin analysis only. 
            Not a medical device. Not intended to diagnose, treat, cure, or prevent any disease. 
            Consult a dermatologist for medical concerns.
          </p>
        </div>
        <p className="text-sm text-[#52525B] text-center">
          © {new Date().getFullYear()} Twacha Labs Limited. All rights reserved. Made in London.
        </p>
      </div>
    </footer>
  );
}
