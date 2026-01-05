'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle2, AlertCircle } from 'lucide-react';

type ScanStatus = 'idle' | 'scanning' | 'complete';
type AnalysisStatus = 'ACUTE' | 'STABLE' | 'NORMAL';

export default function Scanner() {
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startScan = async () => {
    setStatus('scanning');
    setScanProgress(0);

    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    // Simulate scan completion after 2.5 seconds
    setTimeout(() => {
      clearInterval(interval);
      setScanProgress(100);
      setStatus('complete');
      // Randomly assign analysis status for demo
      const statuses: AnalysisStatus[] = ['ACUTE', 'STABLE', 'NORMAL'];
      setAnalysisStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    }, 2500);
  };

  const resetScan = () => {
    setStatus('idle');
    setAnalysisStatus(null);
    setScanProgress(0);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 md:px-12 py-12">
      {/* Scanner Container */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Scanner View */}
        <div className="relative bg-gray-50 aspect-video flex items-center justify-center">
          {/* Camera Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Camera className="w-16 h-16 text-gray-400" />
            </div>
          </div>

          {/* Scanning Overlay Frame */}
          <div className="absolute inset-4 border-2 border-gray-300 rounded-2xl pointer-events-none">
            {/* Corner indicators */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gray-400 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gray-400 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gray-400 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gray-400 rounded-br-lg"></div>
          </div>

          {/* Scanning Animation */}
          {status === 'scanning' && (
            <motion.div
              className="absolute inset-4 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Scanning line */}
              <motion.div
                className="absolute left-0 right-0 h-0.5 bg-blue-500"
                initial={{ top: '0%' }}
                animate={{ top: '100%' }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              {/* Pulsing circle */}
              <motion.div
                className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 border-2 border-blue-500 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
          )}

          {/* Progress Bar */}
          {status === 'scanning' && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${scanProgress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                Analyzing... {scanProgress}%
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 border-t border-gray-100">
          {status === 'idle' && (
            <motion.button
              onClick={startScan}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-3.5 bg-[#18181B] text-white font-medium rounded-full hover:shadow-lg transition-shadow"
            >
              Start Scan
            </motion.button>
          )}

          {status === 'scanning' && (
            <div className="text-center">
              <p className="text-sm text-[#52525B]">Scanning in progress...</p>
            </div>
          )}

          {status === 'complete' && (
            <motion.button
              onClick={resetScan}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-3.5 bg-white border border-gray-200 text-[#18181B] font-medium rounded-full hover:shadow-md transition-shadow"
            >
              Scan Again
            </motion.button>
          )}
        </div>
      </div>

      {/* Result Card */}
      <AnimatePresence>
        {status === 'complete' && analysisStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  analysisStatus === 'ACUTE'
                    ? 'bg-yellow-100'
                    : analysisStatus === 'STABLE'
                    ? 'bg-green-100'
                    : 'bg-blue-100'
                }`}
              >
                {analysisStatus === 'ACUTE' ? (
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-medium text-[#52525B] uppercase tracking-wider">
                    Status:
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      analysisStatus === 'ACUTE'
                        ? 'bg-yellow-100 text-yellow-800'
                        : analysisStatus === 'STABLE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {analysisStatus}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-[#52525B]">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="font-medium">Analysis Date:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="font-medium">Scan ID:</span>
                    <span className="font-mono text-xs">
                      {Math.random().toString(36).substring(7).toUpperCase()}
                    </span>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-[#52525B] leading-relaxed">
                      {analysisStatus === 'ACUTE'
                        ? 'Immediate attention recommended. Consult with a dermatologist for detailed assessment.'
                        : analysisStatus === 'STABLE'
                        ? 'Skin condition appears stable. Continue current routine and monitor changes.'
                        : 'No significant concerns detected. Maintain regular skincare regimen.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
