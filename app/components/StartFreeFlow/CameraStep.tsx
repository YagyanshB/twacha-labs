'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, Check, Image as ImageIcon, X, Loader2, AlertCircle } from 'lucide-react';
import Webcam from 'react-webcam';
import { uploadImageToSupabase } from '@/lib/image-upload';
import MedicalDisclaimerModal from '../MedicalDisclaimerModal';
import { useIsMobile } from '@/hooks/useIsMobile';

// YCbCr-based skin color detection (works for all skin tones)
function isSkinColor(r: number, g: number, b: number): boolean {
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

  return cr > 135 && cr < 180 && cb > 85 && cb < 135 && y > 80;
}

interface CameraStepProps {
  onCapture: (imageUrl: string) => void;
  onBack: () => void;
}

type Mode = 'camera' | 'upload';

interface ValidationState {
  faceDetected: boolean;
  centered: boolean;
  goodLighting: boolean;
  correctDistance: boolean;
  holdingStill: boolean;
  statusMessage: string;
}

interface FacePosition {
  x: number;
  y: number;
  width: number;
  timestamp: number;
}

export default function CameraStep({ onCapture, onBack }: CameraStepProps) {
  if (typeof window === 'undefined') {
    return null;
  }

  const isMobile = useIsMobile();
  const [mode, setMode] = useState<Mode>('camera');
  const [validation, setValidation] = useState<ValidationState>({
    faceDetected: false,
    centered: false,
    goodLighting: false,
    correctDistance: false,
    holdingStill: false,
    statusMessage: 'Initializing camera...',
  });
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [hasConsented, setHasConsented] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);

  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lightingCanvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const validationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const facePositionHistoryRef = useRef<FacePosition[]>([]);

  const allConditionsMet = validation.faceDetected && validation.centered && validation.goodLighting && validation.correctDistance && validation.holdingStill;

  const handleImageUpload = async (imageData: string | File) => {
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const userId = 'temp_user_id';
      const imageUrl = await uploadImageToSupabase(imageData, userId);
      onCapture(imageUrl);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload image. Please try again.');
      setIsUploading(false);
    }
  };

  const handleCapture = async () => {
    if (webcamRef.current) {
      // Allow capture even if conditions not met (for testing/fallback)
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        await handleImageUpload(imageSrc);
      }
    }
  };

  const handleFileSelect = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setCapturedImage(result);
        await handleImageUpload(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Native lighting check using Canvas
  const checkLighting = useCallback((video: HTMLVideoElement): boolean => {
    if (!lightingCanvasRef.current) return false;

    const canvas = lightingCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return false;

    // Draw video frame to tiny 10x10 canvas
    ctx.drawImage(video, 0, 0, 10, 10);

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, 10, 10);
    const pixels = imageData.data;

    // Calculate average brightness (RGB average)
    let totalBrightness = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
    }

    const averageBrightness = totalBrightness / (pixels.length / 4);

    // Good lighting: between 80 and 200 (updated to match requirements)
    return averageBrightness >= 80 && averageBrightness <= 200;
  }, []);

  // Check if user is holding still (5th condition)
  const checkStability = useCallback((currentPosition: FacePosition): boolean => {
    const now = Date.now();
    const history = facePositionHistoryRef.current;

    // Add current position to history
    history.push(currentPosition);

    // Remove positions older than 1.5 seconds
    const recentHistory = history.filter(pos => now - pos.timestamp < 1500);
    facePositionHistoryRef.current = recentHistory;

    // Need at least 1 second of data (assuming ~6-7 samples at 150ms intervals)
    if (recentHistory.length < 6) {
      return false;
    }

    // Check if all recent positions are within acceptable movement threshold
    const firstPos = recentHistory[0];
    const movementThreshold = 15; // pixels

    for (const pos of recentHistory) {
      const distanceX = Math.abs(pos.x - firstPos.x);
      const distanceY = Math.abs(pos.y - firstPos.y);
      const widthChange = Math.abs(pos.width - firstPos.width);

      // If any position differs too much, user is not stable
      if (distanceX > movementThreshold || distanceY > movementThreshold || widthChange > movementThreshold) {
        return false;
      }
    }

    return true;
  }, []);

  // Face detection and validation - Improved for real-time detection
  const validateFrame = useCallback(async () => {
    if (typeof window === 'undefined' || !webcamRef.current) {
      return;
    }

    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) {
      return;
    }

    // Check lighting first (no model needed)
    const lightingGood = checkLighting(video);

    // If model not loaded yet, just check lighting
    if (!modelRef.current) {
      setValidation(prev => ({
        ...prev,
        faceDetected: false,
        centered: false,
        correctDistance: false,
        holdingStill: false,
        goodLighting: lightingGood,
        statusMessage: 'Loading face detection...',
      }));
      return;
    }

    try {
      // Run face detection with returnTensors: false for better performance
      const predictions = await modelRef.current.estimateFaces(video, false);
      
      if (predictions.length === 0) {
        // Clear position history when no face detected
        facePositionHistoryRef.current = [];
        setValidation(prev => ({
          ...prev,
          faceDetected: false,
          centered: false,
          correctDistance: false,
          holdingStill: false,
          goodLighting: lightingGood,
          statusMessage: 'Position your face in the frame',
        }));
        return;
      }

      const face = predictions[0];
      const boundingBox = face.topLeft as [number, number];
      const bottomRight = face.bottomRight as [number, number];
      
      const faceWidth = bottomRight[0] - boundingBox[0];
      const faceHeight = bottomRight[1] - boundingBox[1];
      const faceCenterX = boundingBox[0] + faceWidth / 2;
      const faceCenterY = boundingBox[1] + faceHeight / 2;

      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // Centered check: face center within 15% of viewport center
      const centerX = videoWidth / 2;
      const centerY = videoHeight / 2;
      const toleranceX = videoWidth * 0.15;
      const toleranceY = videoHeight * 0.15;

      const isCentered =
        Math.abs(faceCenterX - centerX) < toleranceX &&
        Math.abs(faceCenterY - centerY) < toleranceY;

      // Distance check: face height should be 30-70% of frame height
      const faceHeightPercent = (faceHeight / videoHeight) * 100;
      const correctDistance = faceHeightPercent >= 30 && faceHeightPercent <= 70;

      // Stability check: holding still for 1+ second
      const currentPosition: FacePosition = {
        x: faceCenterX,
        y: faceCenterY,
        width: faceWidth,
        timestamp: Date.now(),
      };
      const isStable = checkStability(currentPosition);
      
      // Determine status message (prioritize most critical feedback)
      let statusMessage = 'All conditions met!';
      if (!lightingGood) {
        const canvas = lightingCanvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, 10, 10);
            const imageData = ctx.getImageData(0, 0, 10, 10);
            const pixels = imageData.data;
            let totalBrightness = 0;
            for (let i = 0; i < pixels.length; i += 4) {
              totalBrightness += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
            }
            const avg = totalBrightness / (pixels.length / 4);
            statusMessage = avg < 80 ? 'Find better lighting' : 'Too bright - Reduce lighting';
          }
        }
      } else if (!isCentered) {
        statusMessage = 'Center your face in the oval';
      } else if (!correctDistance) {
        statusMessage = faceHeightPercent < 30
          ? 'Move closer to the camera'
          : 'Move further from the camera';
      } else if (!isStable) {
        statusMessage = 'Hold still...';
      }

      setValidation({
        faceDetected: true,
        centered: isCentered,
        goodLighting: lightingGood,
        correctDistance: correctDistance,
        holdingStill: isStable,
        statusMessage,
      });
    } catch (error) {
      console.error('Validation error:', error);
    }
  }, [checkLighting, checkStability]);

  // Load BlazeFace model dynamically
  useEffect(() => {
    if (typeof window === 'undefined' || mode !== 'camera') {
      return;
    }

    let mounted = true;

    const loadModel = async () => {
      try {
        // Dynamic import - Vercel build safe
        const blazeface = await import('@tensorflow-models/blazeface');
        const tf = await import('@tensorflow/tfjs');
        
        // Initialize TensorFlow.js backend
        await tf.ready();
        
        // Load BlazeFace model
        const model = await blazeface.load();
        
        if (mounted) {
          modelRef.current = model;
          setValidation(prev => ({
            ...prev,
            statusMessage: 'Camera ready - Position your face',
          }));
          // Trigger validation immediately after model loads
          if (webcamRef.current?.video && webcamRef.current.video.readyState === 4) {
            setTimeout(() => validateFrame(), 100);
          }
        }
      } catch (error) {
        console.error('Error loading BlazeFace model:', error);
        if (mounted) {
          setValidation(prev => ({
            ...prev,
            statusMessage: 'Camera initialization failed - Please refresh',
          }));
        }
      }
    };

    loadModel();

    return () => {
      mounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (validationIntervalRef.current) {
        clearInterval(validationIntervalRef.current);
      }
    };
  }, [mode]);

  // Start validation loop when camera is ready - Run more frequently for real-time detection
  useEffect(() => {
    if (typeof window === 'undefined' || mode !== 'camera') {
      return;
    }

    const video = webcamRef.current?.video;
    if (!video) {
      return;
    }

    const startValidation = () => {
      // Wait for model to load
      const checkModel = () => {
        if (!modelRef.current) {
          // Retry after 100ms if model not loaded yet (max 30 attempts = 3 seconds)
          let attempts = 0;
          const retryCheck = () => {
            attempts++;
            if (modelRef.current) {
              if (video.readyState === 4) {
                // Run validation every 150ms for real-time feedback
                validationIntervalRef.current = setInterval(() => {
                  if (modelRef.current && video.readyState === 4) {
                    validateFrame();
                  }
                }, 150);
              } else {
                video.addEventListener('loadedmetadata', () => {
                  validationIntervalRef.current = setInterval(() => {
                    if (modelRef.current && video.readyState === 4) {
                      validateFrame();
                    }
                  }, 150);
                }, { once: true });
              }
            } else if (attempts < 30) {
              setTimeout(retryCheck, 100);
            } else {
              // Model failed to load - allow manual capture anyway
              setValidation(prev => ({
                ...prev,
                statusMessage: 'Face detection unavailable - You can still capture',
              }));
            }
          };
          setTimeout(retryCheck, 100);
          return;
        }

        if (video.readyState === 4) {
          // Run validation every 150ms for real-time feedback
          validationIntervalRef.current = setInterval(() => {
            if (modelRef.current && video.readyState === 4) {
              validateFrame();
            }
          }, 150);
        } else {
          video.addEventListener('loadedmetadata', () => {
            validationIntervalRef.current = setInterval(() => {
              if (modelRef.current && video.readyState === 4) {
                validateFrame();
              }
            }, 150);
          }, { once: true });
        }
      };

      checkModel();
    };

    // Wait for video to be ready
    if (video.readyState >= 2) {
      startValidation();
    } else {
      video.addEventListener('loadedmetadata', startValidation, { once: true });
      video.addEventListener('canplay', startValidation, { once: true });
    }

    return () => {
      if (validationIntervalRef.current) {
        clearInterval(validationIntervalRef.current);
        validationIntervalRef.current = null;
      }
    };
  }, [mode, validateFrame]);

  // Auto-capture countdown when all conditions are met
  useEffect(() => {
    if (typeof window === 'undefined' || mode !== 'camera' || capturedImage || isUploading) {
      return;
    }

    // Start countdown when all conditions met
    if (allConditionsMet && countdown === null) {
      setCountdown(3);
    }

    // Cancel countdown if conditions no longer met
    if (!allConditionsMet && countdown !== null) {
      setCountdown(null);
    }

    // Countdown timer
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }

    // Auto-capture when countdown reaches 0
    if (countdown === 0) {
      handleCapture();
      setCountdown(null);
    }
  }, [allConditionsMet, countdown, mode, capturedImage, isUploading]);

  const handleRetake = () => {
    setCapturedImage(null);
    setPreviewImage(null);
    setCountdown(null); // Clear countdown
    facePositionHistoryRef.current = []; // Clear position history
    setValidation({
      faceDetected: false,
      centered: false,
      goodLighting: false,
      correctDistance: false,
      holdingStill: false,
      statusMessage: 'Position your face in the frame',
    });
  };

  return (
    <div className="camera-step">
      <div className="camera-step-content">
        {/* Hidden canvas for lighting detection */}
        <canvas
          ref={lightingCanvasRef}
          width={10}
          height={10}
          style={{ display: 'none' }}
        />

        {/* Title */}
        <div className="funnel-header">
          <h1>{mode === 'camera' ? 'Take your photo' : 'Upload your photo'}</h1>
          <p>
            {mode === 'camera' 
              ? 'Position your face for the best results'
              : 'Select or drag a photo from your device'
            }
          </p>
        </div>

        {/* Mode Toggle - Always Visible */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '24px',
          paddingLeft: isMobile ? 'env(safe-area-inset-left)' : '0',
          paddingRight: isMobile ? 'env(safe-area-inset-right)' : '0',
        }}>
          <button
            type="button"
            onClick={() => {
              setMode('camera');
              handleRetake();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: isMobile ? '16px 20px' : '14px 28px',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '100px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: mode === 'camera' ? '#0a0a0a' : '#ffffff',
              color: mode === 'camera' ? '#ffffff' : '#444444',
              border: mode === 'camera' ? '2px solid #0a0a0a' : '2px solid #e5e5e5',
              flex: isMobile ? '1' : 'none',
              minHeight: '48px',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            Camera
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('upload');
              handleRetake();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: isMobile ? '16px 20px' : '14px 28px',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '100px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: mode === 'upload' ? '#0a0a0a' : '#ffffff',
              color: mode === 'upload' ? '#ffffff' : '#444444',
              border: mode === 'upload' ? '2px solid #0a0a0a' : '2px solid #e5e5e5',
              flex: isMobile ? '1' : 'none',
              minHeight: '48px',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload Photo
          </button>
        </div>

        {/* Camera View or Upload Area */}
        <div className="camera-view">
          {mode === 'camera' ? (
            <>
              {!capturedImage ? (
                <>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="camera-feed"
                    videoConstraints={{
                      width: 640,
                      height: 480,
                      facingMode: 'user',
                    }}
                  />
                  
                  {/* Status Message Overlay */}
                  {validation.statusMessage && !countdown && (
                    <div className="status-message-overlay">
                      <div className="status-message-content">
                        {!allConditionsMet && (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        )}
                        <span className="status-message-text">{validation.statusMessage}</span>
                      </div>
                    </div>
                  )}

                  {/* Countdown Overlay */}
                  {countdown !== null && countdown > 0 && (
                    <div className="countdown-overlay">
                      <div className="countdown-number">{countdown}</div>
                      <div className="countdown-text">Get ready!</div>
                    </div>
                  )}

                  {/* Face Guide Overlay */}
                  <div className="face-guide">
                    <div
                      className={`face-guide-oval ${
                        !validation.faceDetected
                          ? 'no-face'
                          : allConditionsMet
                            ? 'ready'
                            : 'conditions-not-met'
                      }`}
                    ></div>
                  </div>
                </>
              ) : (
                <img src={capturedImage} alt="Captured" className="captured-image" />
              )}
            </>
          ) : (
            <>
              {!previewImage ? (
                <>
                  <div
                    ref={dropZoneRef}
                    className={`upload-zone ${isDragging ? 'dragging' : ''} ${!hasConsented ? 'opacity-50' : ''}`}
                    onDragOver={hasConsented ? handleDragOver : (e) => e.preventDefault()}
                    onDragLeave={hasConsented ? handleDragLeave : (e) => e.preventDefault()}
                    onDrop={hasConsented ? handleDrop : (e) => e.preventDefault()}
                    onClick={() => {
                      if (!hasConsented) {
                        alert('Please accept the medical disclaimer first');
                        return;
                      }
                      fileInputRef.current?.click();
                    }}
                    style={{
                      cursor: hasConsented ? 'pointer' : 'not-allowed',
                      pointerEvents: hasConsented ? 'auto' : 'auto', // Keep auto to allow onClick alert
                    }}
                  >
                    <div className="upload-zone-content">
                      <div className="upload-icon-wrapper">
                        <ImageIcon className="upload-icon" />
                      </div>
                      <h3 className="upload-title">Drop your photo here</h3>
                      <p className="upload-subtitle">or click to browse</p>
                      <p className="upload-hint">Supports JPG, PNG, and WebP</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handleFileUpload}
                      disabled={!hasConsented}
                      className="hidden"
                    />
                  </div>
                  {/* Prominent Upload Button Below Drop Zone */}
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="primary-cta camera-button flex items-center gap-2"
                    >
                      <Upload className="button-icon" />
                      Choose photo from device
                    </button>
                  </div>
                </>
              ) : (
                <div className="upload-preview">
                  <img src={previewImage} alt="Preview" className="captured-image" />
                  <button
                    onClick={handleRetake}
                    className="upload-retake-button"
                    aria-label="Remove photo"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Checklist (only for camera mode) */}
        {mode === 'camera' && !capturedImage && (
          <div className="checklist">
            <ChecklistItem
              label="Face detected"
              checked={validation.faceDetected}
            />
            <ChecklistItem
              label="Centered"
              checked={validation.centered}
            />
            <ChecklistItem
              label="Good distance"
              checked={validation.correctDistance}
            />
            <ChecklistItem
              label="Good lighting"
              checked={validation.goodLighting}
            />
            <ChecklistItem
              label="Holding still"
              checked={validation.holdingStill}
            />
          </div>
        )}

        {/* Upload Error Message */}
        {uploadError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="text-sm">{uploadError}</p>
          </div>
        )}

        {/* Medical Disclaimer Consent - REQUIRED */}
        {!capturedImage && (
          <div style={{
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={hasConsented}
                onChange={(e) => setHasConsented(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  marginTop: '2px',
                  accentColor: '#0a0a0a',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '13px', color: '#92400e', lineHeight: 1.5 }}>
                I understand that Twacha Labs is an <strong>AI tool for cosmetic analysis</strong>,
                NOT a medical device. It cannot diagnose skin diseases, cancer, or medical conditions.
                I agree to the{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDisclaimerModal(true);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0a0a0a',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    padding: 0,
                    font: 'inherit',
                    fontWeight: '600',
                  }}
                >
                  Medical Disclaimer
                </button>
                {' '}and{' '}
                <a href="/privacy" target="_blank" style={{ color: '#0a0a0a', fontWeight: '600' }}>Privacy Policy</a>.
              </span>
            </label>
          </div>
        )}

        {/* Action Buttons */}
        <div className="camera-actions">
          {mode === 'camera' ? (
            <>
              {!capturedImage ? (
                <>
                  <button
                    onClick={handleCapture}
                    disabled={isUploading || !hasConsented}
                    className={`primary-cta camera-button ${(!allConditionsMet || !hasConsented) ? 'opacity-60' : ''} ${isUploading ? 'disabled' : ''}`}
                    type="button"
                    title={!hasConsented ? 'Please accept disclaimer first' : !allConditionsMet ? 'Position your face properly for best results' : 'Ready to capture'}
                    style={{
                      cursor: (!hasConsented || isUploading) ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="button-icon animate-spin" />
                        Uploading...
                      </>
                    ) : !hasConsented ? (
                      <>
                        <Camera className="button-icon" />
                        Accept disclaimer to continue
                      </>
                    ) : (
                      <>
                        <Camera className="button-icon" />
                        Capture & Analyze
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleRetake}
                  disabled={isUploading}
                  className="secondary-cta camera-button"
                  type="button"
                >
                  Retake photo
                </button>
              )}
            </>
          ) : (
            <>
              {!previewImage ? (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || !hasConsented}
                    className={`primary-cta camera-button ${!hasConsented ? 'opacity-60' : ''}`}
                    type="button"
                    title={!hasConsented ? 'Please accept disclaimer first' : 'Choose photo'}
                    style={{
                      cursor: (!hasConsented || isUploading) ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Upload className="button-icon" />
                    {!hasConsented ? 'Accept disclaimer to continue' : 'Choose photo'}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleRetake}
                  disabled={isUploading}
                  className="secondary-cta camera-button"
                  type="button"
                >
                  Choose different photo
                </button>
              )}
            </>
          )}
        </div>

        {/* Helper Text */}
        <p className="helper-text">
          {mode === 'camera'
            ? "Stand in good light, face forward, and keep your phone at arm's length"
            : "Make sure your photo is clear and well-lit for best results"
          }
        </p>
      </div>

      {/* Medical Disclaimer Modal */}
      <MedicalDisclaimerModal
        isOpen={showDisclaimerModal}
        onClose={() => setShowDisclaimerModal(false)}
      />
    </div>
  );
}

function ChecklistItem({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className={`checklist-item ${checked ? 'checked' : ''}`}>
      <div className="checklist-icon">
        {checked ? (
          <Check className="w-5 h-5 text-white" />
        ) : (
          <div className="checklist-dot"></div>
        )}
      </div>
      <span>{label}</span>
    </div>
  );
}
