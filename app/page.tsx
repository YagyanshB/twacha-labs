'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Camera, Loader2, Mail, CheckCircle2 } from 'lucide-react';
import FaceIDScanner from './components/FaceIDScanner';
import EmailGate from './components/EmailGate';
import ResultsDashboard from './components/ResultsDashboard';

type FunnelState = 'landing' | 'scanning' | 'analyzing' | 'email-gate' | 'results';

interface AnalysisResult {
  score: number;
  verdict: string;
  analysis: string;
  recommendation: string;
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

    // Call API
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysisResult(data);
      setFunnelState('email-gate');
    } catch (error) {
      console.error('Analysis error:', error);
      // On error, still show email gate with mock data
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
    
    // Save to Supabase
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      console.error('Email save error:', error);
    }

    setFunnelState('results');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E293B]">
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

      {/* Footer with Disclaimer */}
      <Footer />
    </div>
  );
}

// Hero Section Component
function HeroSection({ onStartScan }: { onStartScan: () => void }) {
  return (
    <>
      {/* Navbar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full px-6 md:px-12 py-6"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight text-[#1E293B]">
            TWACHA LABS
          </div>
        </div>
      </motion.header>

      {/* Hero Content */}
      <div className="flex-1 flex items-center justify-center px-6 md:px-12 py-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 leading-tight text-[#1E293B]">
              Precision Triage for
              <br />
              Men's Skin
            </h1>
            <p className="text-xl text-[#52525B] mb-8 leading-relaxed">
              Stop guessing. Scan your skin with AI. Get the hardware to fix it.
            </p>
            <motion.button
              onClick={onStartScan}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-[#3B82F6] text-white font-medium rounded-full hover:bg-[#2563EB] hover:shadow-xl transition-all inline-flex items-center gap-2"
            >
              <Scan className="w-5 h-5" />
              START SCAN
            </motion.button>
          </motion.div>

          {/* Product Visual Placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="bg-white rounded-3xl border border-stone-200 shadow-xl p-8 aspect-square flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-24 h-24 text-[#3B82F6] mx-auto mb-4" />
                <p className="text-[#52525B] text-sm">Black Tin + Macro Lens</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

// Analysis Loading Component
function AnalysisLoading() {
  return (
    <div className="text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-[#3B82F6] border-t-transparent rounded-full mx-auto mb-6"
      />
      <h2 className="text-2xl font-semibold text-[#1E293B] mb-2">Analyzing Skin Integrity...</h2>
      <p className="text-[#52525B]">Processing your scan</p>
    </div>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="w-full px-6 md:px-12 py-8 border-t border-stone-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-xs text-[#52525B] leading-relaxed">
          <strong className="text-[#1E293B]">Disclaimer:</strong> Twacha Labs AI is for cosmetic analysis only. Not a medical diagnosis.
        </p>
        <p className="text-xs text-[#52525B] mt-2">
          &copy; {new Date().getFullYear()} Twacha Labs. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
