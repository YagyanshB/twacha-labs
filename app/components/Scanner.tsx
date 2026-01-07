'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle2, AlertCircle, Upload } from 'lucide-react';
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

    // Convert file to Base64
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
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6">
      {/* Scanner Container - Large View */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Scanner View - 80% screen height */}
        <div className="relative bg-gray-900" style={{ height: '80vh', minHeight: '500px' }}>
          {/* Webcam or Uploaded Image Preview */}
          {uploadedImage ? (
            <img
              src={uploadedImage}
              alt="Uploaded preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
              videoConstraints={{
                facingMode: 'user',
              }}
            />
          )}

          {/* Tactical HUD Overlay - Updated for larger size */}
          <div className="absolute inset-4 border-2 border-gray-300 rounded-2xl pointer-events-none">
            {/* Corner indicators */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-gray-400 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-gray-400 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-gray-400 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-gray-400 rounded-br-lg"></div>
            
            {/* Grid overlay */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-gray-400/30"
                  style={{
                    gridColumn: i < 2 ? (i % 2 === 0 ? '1' : '3') : '2',
                    gridRow: i < 2 ? '1' : '3',
                  }}
                />
              ))}
            </div>
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
                className="absolute left-0 right-0 h-1 bg-blue-500"
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
                className="absolute top-1/2 left-1/2 w-40 h-40 -translate-x-1/2 -translate-y-1/2 border-4 border-blue-500 rounded-full"
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
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-80">
              <div className="h-2 bg-gray-200/50 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${scanProgress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <p className="text-sm text-white text-center mt-3 font-medium">
                Analyzing... {scanProgress}%
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg"
            >
              {error}
            </motion.div>
          )}
        </div>

        {/* Controls - Bottom Bar */}
        <div className="p-6 border-t border-gray-100 bg-white">
          {status === 'idle' && (
            <div className="flex gap-4">
              {/* Scan Button */}
              <motion.button
                onClick={handleScan}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-6 py-4 bg-[#18181B] text-white font-medium rounded-full hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Scan
              </motion.button>

              {/* Upload Button */}
              <motion.button
                onClick={handleUploadClick}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-6 py-4 bg-white border-2 border-gray-200 text-[#18181B] font-medium rounded-full hover:shadow-md hover:border-gray-300 transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Upload Image
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
              className="w-full px-6 py-4 bg-white border border-gray-200 text-[#18181B] font-medium rounded-full hover:shadow-md transition-shadow"
            >
              Scan Again
            </motion.button>
          )}
        </div>
      </div>

      {/* Result Card */}
      <AnimatePresence>
        {status === 'complete' && analysisResult && (
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
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-medium text-[#52525B] uppercase tracking-wider">
                    Verdict:
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
                <div className="space-y-2 text-sm text-[#52525B]">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="font-medium">Diagnosis:</span>
                    <span className="text-right max-w-xs">{analysisResult.diagnosis}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="font-medium">Confidence:</span>
                    <span>{(analysisResult.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="font-medium">Analysis Date:</span>
                    <span>{new Date().toLocaleDateString()}</span>
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
    </div>
  );
}
