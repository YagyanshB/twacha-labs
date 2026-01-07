'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle2, AlertCircle, Upload, X } from 'lucide-react';
import Webcam from 'react-webcam';

type ScanStatus = 'idle' | 'scanning' | 'complete';
type AnalysisResult = {
  verdict: 'CLEAR' | 'POP' | 'STOP' | 'DOCTOR';
  diagnosis: string;
  confidence: number;
};

export default function Scanner() {
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const captureImage = useCallback(() => {
    if (!webcamRef.current) return null;
    return webcamRef.current.getScreenshot();
  }, []);

  const analyzeImage = async (imageBase64: string) => {
    setStatus('scanning');
    setScanProgress(0);
    setError(null);

    // Simulate scanning progress
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 3;
      });
    }, 100);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageBase64 }),
      });

      clearInterval(progressInterval);
      setScanProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      setAnalysisResult(data);
      setStatus('complete');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Scan Failed');
      setStatus('idle');
    }
  };

  const handleScan = () => {
    const image = captureImage();
    if (image) {
      analyzeImage(image);
    } else {
      setError('Failed to capture image. Please ensure camera permissions are granted.');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Convert file to Base64 using FileReader
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setUploadedImage(base64String);
      // Automatically analyze the uploaded image
      analyzeImage(base64String);
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetScan = () => {
    setStatus('idle');
    setAnalysisResult(null);
    setScanProgress(0);
    setUploadedImage(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-black overflow-hidden">
      {/* Full-Screen Camera/Image View */}
      <div className="relative w-full h-full">
        {/* Webcam or Uploaded Image Preview - Full Screen with object-cover */}
        {uploadedImage ? (
          <img
            src={uploadedImage}
            alt="Uploaded preview"
            className="w-full h-full object-cover"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full h-full"
            style={{ objectFit: 'cover' }}
            videoConstraints={{
              facingMode: 'user',
            }}
          />
        )}

        {/* Tactical HUD Overlay - Full Screen Layout */}
        {status === 'idle' && (
          <div className="absolute inset-0 border-8 border-white/20 rounded-none pointer-events-none">
            {/* Corner indicators - Larger for full screen */}
            <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-white/60 rounded-tl-lg"></div>
            <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-white/60 rounded-tr-lg"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-white/60 rounded-bl-lg"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-white/60 rounded-br-lg"></div>
            
            {/* Grid overlay - Rule of thirds */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
              <div className="border-r border-white/20"></div>
              <div className="border-r border-white/20"></div>
              <div></div>
              <div className="border-r border-white/20 border-t border-white/20"></div>
              <div className="border-r border-white/20 border-t border-white/20"></div>
              <div className="border-t border-white/20"></div>
              <div className="border-r border-white/20 border-t border-white/20"></div>
              <div className="border-r border-white/20 border-t border-white/20"></div>
              <div className="border-t border-white/20"></div>
            </div>
          </div>
        )}

        {/* Scanning Overlay - Clean Animation */}
        {status === 'scanning' && (
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              {/* Spinning Loader */}
              <motion.div
                className="w-20 h-20 border-4 border-white border-t-transparent rounded-full mx-auto mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-white text-xl font-medium mb-2">Scanning...</p>
              <p className="text-white/70 text-sm">{scanProgress}%</p>
            </div>
          </motion.div>
        )}

        {/* Error Message Overlay */}
        {error && status !== 'scanning' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg z-50"
          >
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-3 hover:opacity-70"
            >
              <X className="w-4 h-4 inline" />
            </button>
          </motion.div>
        )}

        {/* Result Card Overlay - Appears on top of image/camera */}
        <AnimatePresence>
          {status === 'complete' && analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute bottom-24 left-0 right-0 bg-white rounded-t-3xl shadow-2xl border-t border-gray-200 p-6 max-h-[60vh] overflow-y-auto z-40"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center ${
                    analysisResult.verdict === 'DOCTOR'
                      ? 'bg-yellow-100'
                      : analysisResult.verdict === 'STOP'
                      ? 'bg-orange-100'
                      : analysisResult.verdict === 'POP'
                      ? 'bg-blue-100'
                      : 'bg-green-100'
                  }`}
                >
                  {analysisResult.verdict === 'DOCTOR' || analysisResult.verdict === 'STOP' ? (
                    <AlertCircle className="w-7 h-7 text-yellow-600" />
                  ) : (
                    <CheckCircle2 className="w-7 h-7 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-medium text-[#52525B] uppercase tracking-wider">
                      Verdict:
                    </span>
                    <span
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                        analysisResult.verdict === 'DOCTOR'
                          ? 'bg-yellow-100 text-yellow-800'
                          : analysisResult.verdict === 'STOP'
                          ? 'bg-orange-100 text-orange-800'
                          : analysisResult.verdict === 'POP'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {analysisResult.verdict}
                    </span>
                  </div>
                  <div className="space-y-3 text-sm text-[#52525B]">
                    <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                      <span className="font-medium">Diagnosis:</span>
                      <span className="text-right max-w-xs text-black font-medium">{analysisResult.diagnosis}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-3">
                      <span className="font-medium">Confidence:</span>
                      <span className="text-black font-semibold">{(analysisResult.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-3">
                      <span className="font-medium">Analysis Date:</span>
                      <span className="text-black">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs text-[#52525B] leading-relaxed">
                        {analysisResult.verdict === 'CLEAR'
                          ? 'No distinct blemish detected. Your skin appears healthy.'
                          : analysisResult.verdict === 'POP'
                          ? 'Surface-level blemish detected. Safe to extract if desired.'
                          : analysisResult.verdict === 'STOP'
                          ? 'Deep or inflamed blemish detected. Do not extract. Monitor and consult if needed.'
                          : 'Medical attention recommended. Please consult with a dermatologist for detailed assessment.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls - Bottom Bar (Mobile-Optimized) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/60 to-transparent pointer-events-none">
          <div className="pointer-events-auto">
            {status === 'idle' && (
              <div className="flex gap-4 max-w-md mx-auto">
                {/* Scan Button */}
                <motion.button
                  onClick={handleScan}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-6 py-4 bg-white text-black font-semibold rounded-full hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Scan
                </motion.button>

                {/* Upload Button */}
                <motion.button
                  onClick={handleUploadClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-6 py-4 bg-black/40 backdrop-blur-md border-2 border-white/30 text-white font-semibold rounded-full hover:bg-black/60 hover:border-white/50 transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Upload
                </motion.button>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}

            {status === 'scanning' && (
              <div className="text-center">
                <p className="text-white/80 text-sm">Analyzing image...</p>
              </div>
            )}

            {status === 'complete' && (
              <motion.button
                onClick={resetScan}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full max-w-md mx-auto px-6 py-4 bg-white text-black font-semibold rounded-full hover:shadow-lg transition-shadow"
              >
                Scan Again
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
