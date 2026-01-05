'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import { Scan, Lock, AlertTriangle, X } from 'lucide-react';

type ScanState = 'idle' | 'scanning' | 'analyzing' | 'complete' | 'error';

interface AnalysisResult {
  verdict: string;
  reason: string;
}

export default function DemoScanner({ onClose }: { onClose: () => void }) {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [showModal, setShowModal] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const handleRunDiagnostic = async () => {
    if (!webcamRef.current) {
      setError('Camera not available');
      return;
    }

    setScanState('scanning');
    setError(null);
    setAnalysisResult(null);

    // Capture image after a brief delay to show scanning animation
    setTimeout(async () => {
      try {
        const imageSrc = webcamRef.current?.getScreenshot();
        
        if (!imageSrc) {
          throw new Error('Failed to capture image');
        }

        setScanState('analyzing');

        // Send image to API
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: imageSrc }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Analysis failed');
        }

        const data = await response.json();
        setAnalysisResult(data);
        setScanState('complete');
      } catch (err: any) {
        console.error('Analysis error:', err);
        setError(err.message || 'Scan Failed');
        setScanState('error');
      }
    }, 1500); // Show scanning animation for 1.5 seconds before capturing
  };

  const handleUnlock = () => {
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 md:p-12">
      {/* Header with Close Button */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#1E3A2F]">Clinical Diagnostic Demo</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white rounded-full transition-colors"
          aria-label="Close demo"
        >
          <X className="w-5 h-5 text-[#1E3A2F]" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Camera View with Clinical Grid */}
        <div className="relative bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mb-6">
          <div className="relative aspect-video bg-gray-900">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
              videoConstraints={{
                facingMode: 'user',
              }}
            />
            
            {/* Clinical Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div 
                className="w-full h-full"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px',
                }}
              />
            </div>

            {/* Scanning Animation */}
            {(scanState === 'scanning' || scanState === 'analyzing') && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-white/80"
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{
                    duration: 3,
                    ease: "linear",
                    repeat: Infinity,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-32 h-32 border-2 border-white/50 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Warning Overlay */}
            {scanState === 'complete' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-10"
              >
                <div className="bg-orange-500 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium text-sm">
                    WARNING: STANDARD OPTICS DETECTED. SURFACE ANALYSIS ONLY.
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Control Button */}
          <div className="p-6 border-t border-stone-200">
            {scanState === 'idle' && (
              <motion.button
                onClick={handleRunDiagnostic}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-8 py-4 bg-[#1E3A2F] text-white font-medium rounded-full hover:shadow-md transition-shadow flex items-center justify-center gap-2"
              >
                <Scan className="w-5 h-5" />
                RUN DIAGNOSTIC
              </motion.button>
            )}
            {scanState === 'scanning' && (
              <div className="text-center">
                <p className="text-[#52525B] font-medium">Scanning in progress...</p>
                <p className="text-sm text-[#52525B] mt-1">Please hold still</p>
              </div>
            )}
            {scanState === 'analyzing' && (
              <div className="text-center">
                <p className="text-[#52525B] font-medium">Analyzing Tissue Structure...</p>
                <p className="text-sm text-[#52525B] mt-1">AI processing image</p>
              </div>
            )}
            {scanState === 'error' && (
              <div className="text-center">
                <p className="text-red-500 font-medium">{error || 'Scan Failed'}</p>
                <motion.button
                  onClick={handleRunDiagnostic}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4 px-6 py-2 bg-[#1E3A2F] text-white font-medium rounded-full hover:shadow-md transition-shadow"
                >
                  Try Again
                </motion.button>
              </div>
            )}
            {scanState === 'complete' && (
              <motion.button
                onClick={() => {
                  setScanState('idle');
                  setAnalysisResult(null);
                  setError(null);
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-8 py-4 bg-white border border-stone-200 text-[#1E3A2F] font-medium rounded-full hover:shadow-md transition-shadow"
              >
                Run New Scan
              </motion.button>
            )}
          </div>
        </div>

        {/* Results Card */}
        <AnimatePresence>
          {scanState === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8"
            >
              <h3 className="text-xl font-semibold text-[#1E3A2F] mb-6">Analysis Results</h3>
              
              <div className="space-y-6">
                {/* AI Analysis Result */}
                {analysisResult && (
                  <div className="p-4 bg-[#E0E7DF] rounded-lg mb-6">
                    <div className="flex items-start gap-3">
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        analysisResult.verdict === 'POP' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : analysisResult.verdict === 'STOP'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {analysisResult.verdict}
                      </div>
                      <div className="flex-1">
                        <p className="text-[#1E3A2F] font-medium mb-1">Verdict</p>
                        <p className="text-[#52525B] text-sm">{analysisResult.reason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section A - Visible Data */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-stone-100">
                    <span className="text-[#52525B] font-medium">Surface Hydration</span>
                    <span className="text-[#1E3A2F] font-semibold">LOW</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-stone-100">
                    <span className="text-[#52525B] font-medium">Visible Redness</span>
                    <span className="text-[#1E3A2F] font-semibold">DETECTED</span>
                  </div>
                </div>

                {/* Section B - Blurred Data with Lock */}
                <div className="relative">
                  <div className="space-y-4 opacity-60">
                    <div className="flex justify-between items-center py-3 border-b border-stone-100 blur-[6px]">
                      <span className="text-[#52525B] font-medium">Pore Depth</span>
                      <span className="text-[#1E3A2F] font-semibold">--</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-stone-100 blur-[6px]">
                      <span className="text-[#52525B] font-medium">Cystic Risk</span>
                      <span className="text-[#1E3A2F] font-semibold">--</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-stone-100 blur-[6px]">
                      <span className="text-[#52525B] font-medium">Bacterial Load</span>
                      <span className="text-[#1E3A2F] font-semibold">--</span>
                    </div>
                  </div>
                  
                  {/* Lock Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-lg">
                    <Lock className="w-12 h-12 text-[#1E3A2F] mb-4" />
                    <motion.button
                      onClick={handleUnlock}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-[#1E3A2F] text-white font-medium rounded-full hover:shadow-md transition-shadow"
                    >
                      UNLOCK DEEP DATA
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Purchase Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-md w-full p-8"
            >
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-2xl font-semibold text-[#1E3A2F]">Unlock Deep Data</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-[#52525B]" />
                </button>
              </div>
              
              <p className="text-[#52525B] mb-6 leading-relaxed">
                To access deep pore analysis, cystic risk assessment, and bacterial load detection, 
                you need the <strong className="text-[#1E3A2F]">Macro Lens Kit</strong> with 15x magnification.
              </p>
              
              <div className="space-y-4">
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="block w-full px-6 py-4 bg-[#1E3A2F] text-white font-medium rounded-full hover:shadow-md transition-shadow text-center"
                  onClick={(e) => {
                    e.preventDefault();
                    // Replace with actual purchase link
                    alert('Redirecting to Macro Lens Kit purchase page...');
                  }}
                >
                  Purchase Macro Lens Kit
                </motion.a>
                <button
                  onClick={() => setShowModal(false)}
                  className="block w-full px-6 py-4 bg-white border border-stone-200 text-[#1E3A2F] font-medium rounded-full hover:shadow-md transition-shadow"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
