'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import { X, CheckCircle2 } from 'lucide-react';

type ScanStep = 'idle' | 'center' | 'left' | 'right' | 'analyzing' | 'complete' | 'error';

interface AnalysisResult {
  score: number;
  verdict: string;
  analysis: string;
  recommendation: string;
}

export default function DemoScanner({ onClose }: { onClose: () => void }) {
  const [scanStep, setScanStep] = useState<ScanStep>('idle');
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stabilityTimer, setStabilityTimer] = useState<NodeJS.Timeout | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const steps = [
    { key: 'center', label: 'Center your face', progress: 33 },
    { key: 'left', label: 'Turn slightly Left', progress: 66 },
    { key: 'right', label: 'Turn slightly Right', progress: 100 },
  ];

  const currentStepIndex = scanStep === 'center' ? 0 : scanStep === 'left' ? 1 : scanStep === 'right' ? 2 : -1;
  const currentProgress = currentStepIndex >= 0 ? steps[currentStepIndex].progress : 0;

  const captureImage = () => {
    if (!webcamRef.current) return null;
    return webcamRef.current.getScreenshot();
  };

  const handleStartScan = () => {
    setScanStep('center');
    setCapturedImages([]);
    setAnalysisResult(null);
    setError(null);
  };

  useEffect(() => {
    if (scanStep === 'center' || scanStep === 'left' || scanStep === 'right') {
      // Auto-capture after 2 seconds of stability
      const timer = setTimeout(() => {
        const image = captureImage();
        if (image) {
          setCapturedImages((prev) => [...prev, image]);
          
          // Move to next step
          if (scanStep === 'center') {
            setScanStep('left');
          } else if (scanStep === 'left') {
            setScanStep('right');
          } else if (scanStep === 'right') {
            // All 3 images captured, send to API
            setScanStep('analyzing');
            analyzeImages([...capturedImages, image]);
          }
        }
      }, 2000);

      setStabilityTimer(timer);
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [scanStep, capturedImages]);

  const analyzeImages = async (images: string[]) => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      setAnalysisResult(data);
      setScanStep('complete');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Scan Failed');
      setScanStep('error');
    }
  };

  const handleReset = () => {
    setScanStep('idle');
    setCapturedImages([]);
    setAnalysisResult(null);
    setError(null);
    if (stabilityTimer) {
      clearTimeout(stabilityTimer);
      setStabilityTimer(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 md:p-12">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#1E293B]">Skin Integrity Scan</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white rounded-full transition-colors"
          aria-label="Close demo"
        >
          <X className="w-5 h-5 text-[#1E293B]" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* FaceID Scanner View */}
        <div className="relative bg-white rounded-3xl border border-stone-200 card-shadow overflow-hidden mb-6">
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

            {/* Blurred Background Overlay */}
            {(scanStep === 'center' || scanStep === 'left' || scanStep === 'right') && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-md">
                {/* Circular/Oval Cutout */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Progress Ring */}
                    <svg className="w-80 h-80 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.2)"
                        strokeWidth="2"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="3"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: currentProgress / 100 }}
                        transition={{ duration: 0.5 }}
                      />
                    </svg>
                    
                    {/* Cutout Area */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-64 h-80 rounded-full border-4 border-white/50 bg-transparent" />
                    </div>
                  </div>
                </div>

                {/* Instruction Text */}
                <div className="absolute bottom-20 left-0 right-0 text-center z-10">
                  <motion.p
                    key={scanStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-white text-xl font-medium mb-2"
                  >
                    {steps[currentStepIndex]?.label}
                  </motion.p>
                  <p className="text-white/80 text-sm">Hold still...</p>
                </div>
              </div>
            )}

            {/* Analyzing Overlay */}
            {scanStep === 'analyzing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
              >
                <div className="text-center">
                  <motion.div
                    className="w-16 h-16 border-4 border-[#3B82F6] border-t-transparent rounded-full mx-auto mb-4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <p className="text-white text-lg font-medium">Analyzing Skin Integrity...</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="p-6 border-t border-stone-200">
            {scanStep === 'idle' && (
              <motion.button
                onClick={handleStartScan}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-8 py-4 bg-[#3B82F6] text-white font-medium rounded-full hover:shadow-lg transition-shadow"
              >
                Start Face Scan
              </motion.button>
            )}

            {scanStep === 'error' && (
              <div className="text-center">
                <p className="text-red-500 font-medium mb-4">{error || 'Scan Failed'}</p>
                <motion.button
                  onClick={handleReset}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-[#3B82F6] text-white font-medium rounded-full hover:shadow-md transition-shadow"
                >
                  Try Again
                </motion.button>
              </div>
            )}

            {scanStep === 'complete' && (
              <motion.button
                onClick={handleReset}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-8 py-4 bg-white border border-stone-200 text-[#1E293B] font-medium rounded-full hover:shadow-md transition-shadow"
              >
                Scan Again
              </motion.button>
            )}
          </div>
        </div>

        {/* Results Card */}
        <AnimatePresence>
          {scanStep === 'complete' && analysisResult && (
            <ResultsDisplay result={analysisResult} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Results Component with Radial Progress Bar
function ResultsDisplay({ result }: { result: AnalysisResult }) {
  const circumference = 2 * Math.PI * 90; // radius = 90
  const offset = circumference - (result.score / 100) * circumference;
  
  const getColor = () => {
    if (result.score >= 80) return '#10B981'; // Green
    if (result.score >= 50) return '#F59E0B'; // Yellow/Orange
    return '#EF4444'; // Red
  };

  const getStatus = () => {
    if (result.score >= 80) return 'Skin Barrier Intact';
    return 'Barrier Compromised';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-3xl border border-stone-200 card-shadow p-8"
    >
      <h3 className="text-2xl font-semibold text-[#1E293B] mb-8 text-center">Skin Integrity Score</h3>
      
      {/* Radial Progress Bar */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative w-64 h-64">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            {/* Background Circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="12"
            />
            {/* Progress Circle */}
            <motion.circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={getColor()}
              strokeWidth="12"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: result.score / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          {/* Score Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="text-5xl font-bold text-[#1E293B]"
            >
              {result.score}
            </motion.span>
            <span className="text-sm text-[#52525B] mt-1">/ 100</span>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
          result.score >= 80 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          <span className="font-medium text-sm">{getStatus()}</span>
        </div>
      </div>

      {/* Verdict */}
      <div className="mb-6 p-4 bg-[#FDFBF7] rounded-xl border border-stone-200">
        <p className="text-sm font-medium text-[#52525B] mb-2">Verdict</p>
        <p className="text-lg font-semibold text-[#1E293B]">{result.verdict}</p>
      </div>

      {/* Analysis */}
      <div className="mb-6">
        <p className="text-sm font-medium text-[#52525B] mb-2">Analysis</p>
        <p className="text-[#1E293B] leading-relaxed">{result.analysis}</p>
      </div>

      {/* Protocol Recommendation */}
      <div className="p-6 bg-[#3B82F6]/10 rounded-xl border border-[#3B82F6]/20">
        <p className="text-sm font-medium text-[#3B82F6] mb-2">Protocol Recommendation</p>
        <p className="text-[#1E293B] leading-relaxed font-medium">{result.recommendation}</p>
      </div>
    </motion.div>
  );
}
