'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle2, AlertCircle, Upload, X, Image as ImageIcon } from 'lucide-react';
import Webcam from 'react-webcam';
import * as faceDetection from '@tensorflow-models/face-detection';
import * as tf from '@tensorflow/tfjs';

type ScanStatus = 'idle' | 'scanning' | 'complete';
type AnalysisResult = {
  verdict: 'CLEAR' | 'POP' | 'STOP' | 'DOCTOR';
  diagnosis: string; // Cosmetic observation/advice
  confidence: number;
};

type FacePosition = {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
};

type PositioningFeedback = {
  message: string;
  color: 'green' | 'yellow' | 'red';
};

export default function Scanner() {
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [facePosition, setFacePosition] = useState<FacePosition | null>(null);
  const [positioningFeedback, setPositioningFeedback] = useState<PositioningFeedback | null>(null);
  const [autoCaptureCountdown, setAutoCaptureCountdown] = useState<number | null>(null);
  const [detector, setDetector] = useState<faceDetection.FaceDetector | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoCaptureTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize face detector
  useEffect(() => {
    const initDetector = async () => {
      try {
        // Set backend to WebGL for better performance
        await tf.setBackend('webgl');
        await tf.ready();
        
        const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
        const detectorConfig: faceDetection.MediaPipeFaceDetectorMediaPipeModelConfig = {
          runtime: 'mediapipe',
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection',
          modelType: 'short',
        };
        const faceDetector = await faceDetection.createDetector(model, detectorConfig);
        setDetector(faceDetector);
      } catch (err) {
        console.error('Failed to initialize face detector:', err);
        // Don't set error - allow manual scanning
      }
    };

    initDetector();

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (autoCaptureTimerRef.current) {
        clearTimeout(autoCaptureTimerRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Face detection loop
  useEffect(() => {
    if (!detector || status !== 'idle' || uploadedImage || isDetecting) return;

    const detectFaces = async () => {
      if (!webcamRef.current?.video) return;
      
      setIsDetecting(true);
      try {
        const video = webcamRef.current.video;
        if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
          setIsDetecting(false);
          return;
        }
        
        const faces = await detector.estimateFaces(video, { flipHorizontal: false });

        if (faces.length > 0) {
          const face = faces[0];
          const box = face.box;
          
          // Get video dimensions
          const videoWidth = video.videoWidth || video.clientWidth;
          const videoHeight = video.videoHeight || video.clientHeight;
          const displayWidth = video.clientWidth;
          const displayHeight = video.clientHeight;
          
          // Calculate scale factors
          const scaleX = displayWidth / videoWidth;
          const scaleY = displayHeight / videoHeight;
          
          // Convert normalized coordinates to display coordinates
          // BoundingBox uses xMin, yMin, width, height (all normalized 0-1)
          const x = box.xMin * displayWidth;
          const y = box.yMin * displayHeight;
          const width = box.width * displayWidth;
          const height = box.height * displayHeight;
          
          // Calculate center
          const centerX = x + width / 2;
          const centerY = y + height / 2;
          
          const facePos: FacePosition = {
            x,
            y,
            width,
            height,
            centerX,
            centerY,
          };
          
          setFacePosition(facePos);
          setFaceDetected(true);
          
          // Calculate positioning feedback
          const guideCenterX = displayWidth / 2;
          const guideCenterY = displayHeight / 2;
          const guideWidth = displayWidth * 0.35; // 35% of screen width for arm's length selfie
          const guideHeight = displayHeight * 0.45; // Slightly taller oval
          
          const faceCenterX = facePos.centerX;
          const faceCenterY = facePos.centerY;
          const faceSize = Math.max(width, height);
          
          // Calculate distances from guide center
          const offsetX = Math.abs(faceCenterX - guideCenterX);
          const offsetY = Math.abs(faceCenterY - guideCenterY);
          const maxOffset = Math.max(offsetX, offsetY);
          
          // Check if face is properly sized (should be about 30-40% of screen width for arm's length)
          const idealSize = guideWidth;
          const sizeRatio = faceSize / idealSize;
          
          // Determine feedback
          let feedback: PositioningFeedback;
          
          if (sizeRatio < 0.7) {
            // Face too small - move closer
            feedback = {
              message: 'Move closer',
              color: 'yellow',
            };
            setAutoCaptureCountdown(null);
            if (autoCaptureTimerRef.current) {
              clearTimeout(autoCaptureTimerRef.current);
            }
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
          } else if (sizeRatio > 1.3) {
            // Face too large - move back
            feedback = {
              message: 'Move back',
              color: 'yellow',
            };
            setAutoCaptureCountdown(null);
            if (autoCaptureTimerRef.current) {
              clearTimeout(autoCaptureTimerRef.current);
            }
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
          } else if (maxOffset > displayWidth * 0.1) {
            // Face not centered
            let direction = '';
            if (offsetX > offsetY) {
              direction = faceCenterX < guideCenterX ? 'Move right' : 'Move left';
            } else {
              direction = faceCenterY < guideCenterY ? 'Move down' : 'Move up';
            }
            feedback = {
              message: direction,
              color: 'yellow',
            };
            setAutoCaptureCountdown(null);
            if (autoCaptureTimerRef.current) {
              clearTimeout(autoCaptureTimerRef.current);
            }
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
          } else {
            // Face is properly positioned
            feedback = {
              message: 'Perfect! Hold still...',
              color: 'green',
            };
            
            // Start auto-capture countdown
            if (!autoCaptureTimerRef.current) {
              let countdown = 2;
              setAutoCaptureCountdown(countdown);
              
              countdownIntervalRef.current = setInterval(() => {
                countdown -= 0.1;
                setAutoCaptureCountdown(Math.ceil(countdown));
                if (countdown <= 0) {
                  if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                  }
                  setAutoCaptureCountdown(null);
                }
              }, 100);
              
              autoCaptureTimerRef.current = setTimeout(() => {
                handleAutoCapture();
              }, 2000);
            }
          }
          
          setPositioningFeedback(feedback);
        } else {
          setFaceDetected(false);
          setFacePosition(null);
          setPositioningFeedback(null);
          setAutoCaptureCountdown(null);
          if (autoCaptureTimerRef.current) {
            clearTimeout(autoCaptureTimerRef.current);
            autoCaptureTimerRef.current = null;
          }
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
        }
      } catch (err) {
        console.error('Face detection error:', err);
      } finally {
        setIsDetecting(false);
      }
    };

    // Run detection every 100ms for smooth feedback
    detectionIntervalRef.current = setInterval(detectFaces, 100);

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [detector, status, uploadedImage, isDetecting]);

  const captureImage = useCallback(() => {
    if (!webcamRef.current) return null;
    return webcamRef.current.getScreenshot();
  }, []);

  const processImageForAnalysis = async (imageBase64: string): Promise<string> => {
    // If face detection is available and we have a face position, we could crop/enhance
    // For now, we'll use the image as-is, but ensure consistent processing
    return imageBase64;
  };

  const analyzeImage = async (imageBase64: string) => {
    setStatus('scanning');
    setScanProgress(0);
    setError(null);
    setFaceDetected(false);
    setPositioningFeedback(null);
    setAutoCaptureCountdown(null);

    // Clear any timers
    if (autoCaptureTimerRef.current) {
      clearTimeout(autoCaptureTimerRef.current);
      autoCaptureTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // Process image consistently (same for captured and uploaded)
    const processedImage = await processImageForAnalysis(imageBase64);

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
        body: JSON.stringify({ image: processedImage }),
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

  const handleAutoCapture = useCallback(() => {
    if (autoCaptureTimerRef.current) {
      clearTimeout(autoCaptureTimerRef.current);
      autoCaptureTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    const image = captureImage();
    if (image) {
      analyzeImage(image);
    }
  }, [captureImage, analyzeImage]);

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
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setUploadedImage(base64String);
      
      // Process uploaded image the same way as captured images
      await analyzeImage(base64String);
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
    setFaceDetected(false);
    setFacePosition(null);
    setPositioningFeedback(null);
    setAutoCaptureCountdown(null);
    
    // Clear timers
    if (autoCaptureTimerRef.current) {
      clearTimeout(autoCaptureTimerRef.current);
      autoCaptureTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  // Calculate guide oval dimensions (35% width, 45% height for arm's length selfie)
  const guideWidth = typeof window !== 'undefined' ? window.innerWidth * 0.35 : 140;
  const guideHeight = typeof window !== 'undefined' ? window.innerHeight * 0.45 : 180;

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

        {/* Face Guide Oval - Instagram-style */}
        {status === 'idle' && !uploadedImage && (
          <>
            {/* Darkened overlay with cutout */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none">
              <svg className="w-full h-full">
                <defs>
                  <mask id="face-guide-mask">
                    <rect width="100%" height="100%" fill="white" />
                    <ellipse
                      cx="50%"
                      cy="50%"
                      rx={`${(guideWidth / 2) / (typeof window !== 'undefined' ? window.innerWidth : 1) * 100}%`}
                      ry={`${(guideHeight / 2) / (typeof window !== 'undefined' ? window.innerHeight : 1) * 100}%`}
                      fill="black"
                    />
                  </mask>
                </defs>
                <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.5)" mask="url(#face-guide-mask)" />
              </svg>
            </div>
            
            {/* Guide oval border */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="relative rounded-full border-2"
                style={{
                  width: `${guideWidth}px`,
                  height: `${guideHeight}px`,
                  borderColor: positioningFeedback?.color === 'green' 
                    ? 'rgba(74, 222, 128, 0.9)' 
                    : positioningFeedback?.color === 'yellow'
                    ? 'rgba(234, 179, 8, 0.7)'
                    : 'rgba(255, 255, 255, 0.5)',
                  boxShadow: positioningFeedback?.color === 'green'
                    ? '0 0 30px rgba(74, 222, 128, 0.5)'
                    : 'none',
                }}
              >
                {/* Outer glow when face is detected and positioned */}
                {faceDetected && positioningFeedback?.color === 'green' && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-green-400"
                    style={{
                      boxShadow: '0 0 40px rgba(74, 222, 128, 0.6)',
                    }}
                    animate={{
                      boxShadow: [
                        '0 0 40px rgba(74, 222, 128, 0.6)',
                        '0 0 60px rgba(74, 222, 128, 0.8)',
                        '0 0 40px rgba(74, 222, 128, 0.6)',
                      ],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </div>
            </div>
          </>
        )}

        {/* Positioning Feedback Message */}
        {status === 'idle' && !uploadedImage && positioningFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div
              className={`px-6 py-3 rounded-full text-white font-medium text-sm shadow-lg backdrop-blur-md ${
                positioningFeedback.color === 'green'
                  ? 'bg-green-500/90'
                  : positioningFeedback.color === 'yellow'
                  ? 'bg-yellow-500/90'
                  : 'bg-red-500/90'
              }`}
            >
              {positioningFeedback.message}
              {autoCaptureCountdown !== null && positioningFeedback.color === 'green' && (
                <span className="ml-2 font-bold">{autoCaptureCountdown}</span>
              )}
            </div>
          </motion.div>
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
                      <span className="font-medium">Cosmetic Assessment:</span>
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
                          : 'For cosmetic concerns that may need professional evaluation, we recommend consulting with a dermatologist.'}
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
              <div className="flex flex-col gap-3 max-w-md mx-auto">
                {/* Gallery Upload Button - More prominent */}
                <motion.button
                  onClick={handleUploadClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/20 hover:border-white/50 transition-all flex items-center justify-center gap-2"
                >
                  <ImageIcon className="w-5 h-5" />
                  Upload from Gallery
                </motion.button>

                {/* Manual Scan Button */}
                <motion.button
                  onClick={handleScan}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-4 bg-white text-black font-semibold rounded-full hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Capture Now
                </motion.button>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
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
