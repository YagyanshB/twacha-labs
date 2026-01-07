'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Crosshair, CheckCircle2 } from 'lucide-react';

export default function MobileScanDemo() {
  const [scanState, setScanState] = useState<'scanning' | 'results'>('scanning');

  useEffect(() => {
    // Transition to results after 3 seconds
    const timer = setTimeout(() => {
      setScanState('results');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full flex items-center justify-center py-16 px-6">
      <div className="relative">
        {/* iPhone Frame/Bezel */}
        <div className="relative w-[320px] md:w-[400px] mx-auto">
          {/* iPhone Bezel */}
          <div className="bg-black rounded-[3rem] p-3 shadow-2xl">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10" />
            
            {/* Screen */}
            <div className="bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19.5] relative">
              <AnimatePresence mode="wait">
                {scanState === 'scanning' ? (
                  <ScanningView key="scanning" />
                ) : (
                  <ResultsView key="results" />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Scanning View Component
function ScanningView() {
  const [scanLinePosition, setScanLinePosition] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanLinePosition((prev) => {
        const newPos = prev + direction * 2;
        if (newPos >= 100) {
          setDirection(-1);
          return 100;
        }
        if (newPos <= 0) {
          setDirection(1);
          return 0;
        }
        return newPos;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [direction]);

  return (
    <div className="relative w-full h-full bg-gray-900">
      {/* Face Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop"
          alt="Face scan"
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      {/* Scanning Line */}
      <motion.div
        className="absolute left-0 right-0 h-1 bg-[#10B981] shadow-[0_0_20px_#10B981] z-20"
        style={{ top: `${scanLinePosition}%` }}
        animate={{
          boxShadow: [
            '0 0 20px #10B981',
            '0 0 30px #10B981',
            '0 0 20px #10B981',
          ],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Data Points / Crosshairs */}
      <motion.div
        className="absolute top-[20%] left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <Crosshair className="w-6 h-6 text-[#10B981] drop-shadow-[0_0_8px_#10B981]" />
      </motion.div>
      <motion.div
        className="absolute top-[60%] left-[30%] z-10"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <Crosshair className="w-5 h-5 text-[#10B981] drop-shadow-[0_0_8px_#10B981]" />
      </motion.div>
      <motion.div
        className="absolute bottom-[25%] left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        <Crosshair className="w-6 h-6 text-[#10B981] drop-shadow-[0_0_8px_#10B981]" />
      </motion.div>

      {/* Scanning Text */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
        <motion.p
          className="text-white font-medium text-sm mb-1"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Scanning...
        </motion.p>
        <p className="text-white/60 text-xs">Mapping pore structure</p>
      </div>
    </div>
  );
}

// Results View Component
function ResultsView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full h-full bg-[#FDFBF7] p-4 overflow-y-auto"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-[#1E293B] mb-1">Mission Report</h3>
          <p className="text-xs text-[#52525B]">Skin Integrity Analysis</p>
        </div>

        {/* Skin Score */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="6"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#10B981"
                strokeWidth="6"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 0.82 }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="text-3xl font-bold text-[#1E293B]"
              >
                82
              </motion.span>
              <span className="text-xs text-[#52525B]">/ 100</span>
            </div>
          </div>
        </div>

        {/* Skin Type Badge */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1E293B] text-white rounded-full">
            <span className="text-xs font-semibold">TYPE: OILY / REACTIVE</span>
          </div>
        </div>

        {/* Insights */}
        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
            <span className="text-[#1E293B]">Sebum production: <strong className="text-red-600">Critical High</strong></span>
          </div>
          <div className="flex items-start gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
            <span className="text-[#1E293B]">Pore congestion: <strong>Sector 4 (Nose)</strong></span>
          </div>
          <div className="flex items-start gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
            <span className="text-[#1E293B]">Moisture barrier: <strong className="text-green-600">Stable</strong></span>
          </div>
        </div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full py-2.5 bg-[#1E293B] text-white text-xs font-semibold rounded-lg hover:bg-[#1E293B]/90 transition-colors"
        >
          GENERATE KIT
        </motion.button>
      </div>
    </motion.div>
  );
}
