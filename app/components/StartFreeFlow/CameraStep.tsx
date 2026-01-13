'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, Check, Image as ImageIcon, X, Loader2, AlertCircle } from 'lucide-react';
import Webcam from 'react-webcam';
import { uploadImageToSupabase } from '@/lib/image-upload';

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
  statusMessage: string;
}

export default function CameraStep({ onCapture, onBack }: CameraStepProps) {
  if (typeof window === 'undefined') {
    return null;
  }

  const [mode, setMode] = useState<Mode>('camera');
  const [validation, setValidation] = useState<ValidationState>({
    faceDetected: false,
    centered: false,
    goodLighting: false,
    correctDistance: false,
    statusMessage: 'Initializing camera...',
  });
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lightingCanvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const validationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const allConditionsMet = validation.faceDetected && validation.centered && validation.goodLighting && validation.correctDistance;

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
    if (webcamRef.current && allConditionsMet) {
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
    
    // Good lighting: between 40 and 200
    return averageBrightness >= 40 && averageBrightness <= 200;
  }, []);

  // Face detection and validation - Improved for real-time detection
  const validateFrame = useCallback(async () => {
    if (typeof window === 'undefined' || !webcamRef.current || !modelRef.current) {
      return;
    }

    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) {
      return;
    }

    try {
      // Check lighting first (no model needed)
      const lightingGood = checkLighting(video);
      
      // Run face detection with returnTensors: false for better performance
      const predictions = await modelRef.current.estimateFaces(video, false);
      
      if (predictions.length === 0) {
        setValidation(prev => ({
          ...prev,
          faceDetected: false,
          centered: false,
          correctDistance: false,
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
      
      // Centered check: face center within 30% of viewport center (more lenient)
      const centerX = videoWidth / 2;
      const centerY = videoHeight / 2;
      const toleranceX = videoWidth * 0.3;
      const toleranceY = videoHeight * 0.3;
      
      const isCentered = 
        Math.abs(faceCenterX - centerX) < toleranceX &&
        Math.abs(faceCenterY - centerY) < toleranceY;
      
      // Distance check: face width should be 40-75% of canvas width (more lenient)
      const faceWidthPercent = (faceWidth / videoWidth) * 100;
      const correctDistance = faceWidthPercent >= 40 && faceWidthPercent <= 75;
      
      // Determine status message
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
            statusMessage = avg < 40 ? 'Too dark - Find a light source' : 'Too bright - Reduce lighting';
          }
        }
      } else if (!isCentered) {
        statusMessage = 'Center your face in the frame';
      } else if (!correctDistance) {
        statusMessage = faceWidthPercent < 50 
          ? 'Move closer to the camera' 
          : 'Move further from the camera';
      }
      
      setValidation({
        faceDetected: true,
        centered: isCentered,
        goodLighting: lightingGood,
        correctDistance: correctDistance,
        statusMessage,
      });
    } catch (error) {
      console.error('Validation error:', error);
    }
  }, [checkLighting]);

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
    if (typeof window === 'undefined' || mode !== 'camera' || !modelRef.current) {
      return;
    }

    const video = webcamRef.current?.video;
    if (!video) {
      return;
    }

    const startValidation = () => {
      if (video.readyState === 4) {
        // Run validation every 200ms for real-time feedback
        validationIntervalRef.current = setInterval(() => {
          validateFrame();
        }, 200);
      } else {
        video.addEventListener('loadedmetadata', startValidation, { once: true });
      }
    };

    startValidation();

    return () => {
      if (validationIntervalRef.current) {
        clearInterval(validationIntervalRef.current);
      }
    };
  }, [mode, validateFrame]);

  const handleRetake = () => {
    setCapturedImage(null);
    setPreviewImage(null);
    setValidation({
      faceDetected: false,
      centered: false,
      goodLighting: false,
      correctDistance: false,
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

        {/* Mode Tabs */}
        <div className="mode-tabs">
          <button
            onClick={() => {
              setMode('camera');
              handleRetake();
            }}
            className={`mode-tab ${mode === 'camera' ? 'active' : ''}`}
          >
            <Camera className="mode-tab-icon" />
            Camera
          </button>
          <button
            onClick={() => {
              setMode('upload');
              handleRetake();
            }}
            className={`mode-tab ${mode === 'upload' ? 'active' : ''}`}
          >
            <Upload className="mode-tab-icon" />
            Upload
          </button>
        </div>

        {/* Upload Button - Always visible when in camera mode */}
        {mode === 'camera' && !capturedImage && (
          <div className="mb-4 flex justify-center">
            <button
              onClick={() => {
                setMode('upload');
                handleRetake();
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-300 rounded-full hover:border-gray-400"
            >
              <Upload className="w-4 h-4" />
              Upload photo instead
            </button>
          </div>
        )}

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
                  {validation.statusMessage && (
                    <div className="status-message-overlay">
                      <div className="status-message-content">
                        {!allConditionsMet && (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        )}
                        <span className="status-message-text">{validation.statusMessage}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Face Guide Overlay */}
                  <div className="face-guide">
                    <div className="face-guide-oval"></div>
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
                    className={`upload-zone ${isDragging ? 'dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
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
                      onChange={handleFileUpload}
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
              label="Good lighting"
              checked={validation.goodLighting}
            />
            <ChecklistItem
              label="Correct distance"
              checked={validation.correctDistance}
            />
          </div>
        )}

        {/* Upload Error Message */}
        {uploadError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="text-sm">{uploadError}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="camera-actions">
          {mode === 'camera' ? (
            <>
              {!capturedImage ? (
                <button
                  onClick={handleCapture}
                  disabled={!allConditionsMet || isUploading}
                  className={`primary-cta camera-button ${!allConditionsMet || isUploading ? 'disabled' : ''}`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="button-icon animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="button-icon" />
                      Capture photo
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleRetake}
                  disabled={isUploading}
                  className="secondary-cta camera-button"
                >
                  Retake photo
                </button>
              )}
            </>
          ) : (
            <>
              {!previewImage ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="primary-cta camera-button"
                >
                  <Upload className="button-icon" />
                  Choose photo
                </button>
              ) : (
                <button
                  onClick={handleRetake}
                  disabled={isUploading}
                  className="secondary-cta camera-button"
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
