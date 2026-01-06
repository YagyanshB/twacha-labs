'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import { X, ArrowLeft } from 'lucide-react';

type ScanStep = 'idle' | 'center' | 'left' | 'right';

interface FaceIDScannerProps {
  onComplete: (images: string[]) => void;
  onBack: () => void;
}

export default function FaceIDScanner({ onComplete, onBack }: FaceIDScannerProps) {
  const [scanStep, setScanStep] = useState<ScanStep>('idle');
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [stabilityTimer, setStabilityTimer] = useState<NodeJS.Timeout | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const steps = [
    { key: 'center' as ScanStep, label: 'Center your face', progress: 33 },
    { key: 'left' as ScanStep, label: 'Turn slightly Left', progress: 66 },
    { key: 'right' as ScanStep, label: 'Turn slightly Right', progress: 100 },
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
  };

  useEffect(() => {
    if (scanStep === 'center' || scanStep === 'left' || scanStep === 'right') {
      // Auto-capture after 2 seconds
      const timer = setTimeout(() => {
        const image = captureImage();
        if (image) {
          const currentStep = scanStep;
          setCapturedImages((prev) => {
            const newImages = [...prev, image];
            
            // Move to next step or complete after state update
            if (currentStep === 'center') {
              setTimeout(() => setScanStep('left'), 0);
            } else if (currentStep === 'left') {
              setTimeout(() => setScanStep('right'), 0);
            } else if (currentStep === 'right') {
              // All 3 images captured
              setTimeout(() => onComplete(newImages), 0);
            }
            
            return newImages;
          });
        }
      }, 2000);

      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [scanStep, onComplete]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 md:p-12">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#1E293B]" />
        </button>
        <h2 className="text-2xl font-semibold text-[#1E293B]">Skin Scan</h2>
        <div className="w-9" /> {/* Spacer */}
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Scanner View */}
        <div className="relative bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden mb-6">
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

            {/* Blurred Background Overlay with Cutout */}
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
          </div>

          {/* Control Button */}
          <div className="p-6 border-t border-stone-200">
            {scanStep === 'idle' && (
              <motion.button
                onClick={handleStartScan}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-8 py-4 bg-[#3B82F6] text-white font-medium rounded-full hover:bg-[#2563EB] hover:shadow-lg transition-shadow"
              >
                Begin Scan
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
