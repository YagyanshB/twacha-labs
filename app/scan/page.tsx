'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCamera } from './hooks/useCamera';
import { useStabilityCheck } from './hooks/useStabilityCheck';
import { detectFace } from './utils/skinColorDetection';
import { analyzeLighting } from './utils/lightingAnalysis';
import { FaceGuide } from './components/FaceGuide';
import { ScanChecklist } from './components/ScanChecklist';
import { CountdownOverlay } from './components/CountdownOverlay';
import { AnalyzingOverlay } from './components/AnalyzingOverlay';
import { ResultsView } from './components/ResultsView';

type CameraState = 'initializing' | 'ready' | 'scanning' | 'analyzing' | 'results' | 'error';

interface ChecksState {
  faceDetected: boolean;
  faceCentered: boolean;
  goodDistance: boolean;
  goodLighting: boolean;
  holdingStill: boolean;
}

function getStatusMessage(checks: ChecksState, countdown: number | null): string {
  if (countdown !== null) return `Hold still... ${countdown}`;
  if (!checks.faceDetected) return 'Position your face in the frame';
  if (!checks.faceCentered) return 'Center your face';
  if (!checks.goodDistance) return 'Adjust your distance';
  if (!checks.goodLighting) return 'Find better lighting';
  if (!checks.holdingStill) return 'Hold still...';
  return 'Perfect! Capturing...';
}

export default function ScanPage() {
  const router = useRouter();
  const { videoRef, error: cameraError, isLoading: cameraLoading, captureFrame } = useCamera();
  const { checkStability, reset: resetStability } = useStabilityCheck();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [cameraState, setCameraState] = useState<CameraState>('initializing');
  const [checks, setChecks] = useState<ChecksState>({
    faceDetected: false,
    faceCentered: false,
    goodDistance: false,
    goodLighting: false,
    holdingStill: false,
  });
  
  const [countdown, setCountdown] = useState<number | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Initializing camera...');
  const [optimalConditionsMet, setOptimalConditionsMet] = useState(false);
  const [optimalDuration, setOptimalDuration] = useState(0);

  // Initialize camera state
  useEffect(() => {
    if (cameraLoading) {
      setCameraState('initializing');
      setStatusMessage('Initializing camera...');
    } else if (cameraError) {
      setCameraState('error');
      setStatusMessage(cameraError);
    } else {
      setCameraState('ready');
      setStatusMessage('Position your face in the frame');
    }
  }, [cameraLoading, cameraError]);

  // Analyze video frames
  useEffect(() => {
    if (cameraState !== 'ready' && cameraState !== 'scanning') return;
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyzeFrame = () => {
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationFrameRef.current = requestAnimationFrame(analyzeFrame);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw mirrored video frame
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);
      ctx.restore();

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Face detection
      const faceResult = detectFace(imageData, canvas.width, canvas.height);
      
      // Lighting analysis
      const lightingResult = analyzeLighting(imageData);
      
      // Stability check (if face detected)
      let isStable = false;
      if (faceResult.detected && faceResult.centerX && faceResult.centerY) {
        isStable = checkStability(faceResult.centerX, faceResult.centerY);
      } else {
        resetStability();
      }

      // Update checks
      const newChecks: ChecksState = {
        faceDetected: faceResult.detected,
        faceCentered: faceResult.centered || false,
        goodDistance: faceResult.distance === 'good',
        goodLighting: lightingResult.level === 'good',
        holdingStill: isStable,
      };
      
      setChecks(newChecks);

      // Check if all conditions are met
      const allMet = 
        newChecks.faceDetected &&
        newChecks.faceCentered &&
        newChecks.goodDistance &&
        newChecks.goodLighting &&
        newChecks.holdingStill;

      setOptimalConditionsMet(allMet);
      
      if (allMet) {
        setOptimalDuration(prev => prev + 1);
      } else {
        setOptimalDuration(0);
      }

      // Update status message
      setStatusMessage(getStatusMessage(newChecks, countdown));

      animationFrameRef.current = requestAnimationFrame(analyzeFrame);
    };

    analyzeFrame();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraState, videoRef, checkStability, resetStability, countdown]);

  // Auto-capture when conditions are met for 2+ seconds (120 frames at ~60fps)
  useEffect(() => {
    if (optimalConditionsMet && optimalDuration >= 120 && countdown === null && cameraState === 'ready') {
      // Start countdown
      setCountdown(3);
      setCameraState('scanning');
    } else if (!optimalConditionsMet && countdown !== null) {
      // Cancel countdown if conditions no longer met
      setCountdown(null);
      setCameraState('ready');
      setOptimalDuration(0);
    }
  }, [optimalConditionsMet, optimalDuration, countdown, cameraState]);

  // Countdown logic
  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown === 0) {
      captureAndAnalyze();
      return;
    }
    
    const timer = setTimeout(() => {
      setCountdown(c => (c !== null ? c - 1 : null));
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown, captureAndAnalyze]);

  const captureAndAnalyze = useCallback(async () => {
    const imageData = captureFrame();
    if (!imageData) {
      setStatusMessage('Failed to capture image');
      setCameraState('error');
      return;
    }

    setCapturedImage(imageData);
    setCameraState('analyzing');
    setCountdown(null);

    try {
      // Convert data URL to base64
      const base64 = imageData.split(',')[1];

      const response = await fetch('/api/analyze-skin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      setAnalysisResult(result);
      setCameraState('results');
    } catch (error) {
      console.error('Analysis error:', error);
      setStatusMessage('Analysis failed. Please try again.');
      setCameraState('error');
    }
  }, [captureFrame]);

  const handleNewScan = () => {
    setAnalysisResult(null);
    setCapturedImage(null);
    setCountdown(null);
    setOptimalDuration(0);
    setOptimalConditionsMet(false);
    resetStability();
    setChecks({
      faceDetected: false,
      faceCentered: false,
      goodDistance: false,
      goodLighting: false,
      holdingStill: false,
    });
    setCameraState('ready');
  };

  const checklistItems = [
    { label: 'Face detected', checked: checks.faceDetected },
    { label: 'Face centered', checked: checks.faceCentered },
    { label: 'Good distance', checked: checks.goodDistance },
    { label: 'Good lighting', checked: checks.goodLighting },
    { label: 'Holding still', checked: checks.holdingStill },
  ];

  if (cameraState === 'results' && analysisResult && capturedImage) {
    return (
      <ResultsView
        result={analysisResult}
        imageUrl={capturedImage}
        onNewScan={handleNewScan}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafafa',
      padding: '24px',
      paddingTop: '100px',
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#0a0a0a',
            marginBottom: '8px',
            letterSpacing: '-0.02em',
          }}>
            Skin Scanner
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#666',
          }}>
            {statusMessage}
          </p>
        </div>

        {/* Camera View */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4/3',
          borderRadius: '20px',
          overflow: 'hidden',
          background: '#000',
          marginBottom: '24px',
        }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)', // Mirror for selfie mode
            }}
          />
          
          {/* Hidden canvas for analysis */}
          <canvas
            ref={canvasRef}
            style={{ display: 'none' }}
          />
          
          {/* Overlay canvas for face guide */}
          <canvas
            ref={overlayRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
            width={600}
            height={450}
          />
          
          {/* Face Guide */}
          {videoRef.current && (
            <FaceGuide
              width={600}
              height={450}
              isOptimal={optimalConditionsMet}
              faceDetected={checks.faceDetected}
              canvasRef={overlayRef}
            />
          )}
          
          {/* Countdown Overlay */}
          {countdown !== null && <CountdownOverlay countdown={countdown} />}
          
          {/* Analyzing Overlay */}
          {cameraState === 'analyzing' && <AnalyzingOverlay />}
        </div>

        {/* Checklist */}
        <ScanChecklist items={checklistItems} />

        {/* Manual Capture Button (Fallback) */}
        <div style={{
          marginTop: '24px',
          textAlign: 'center',
        }}>
          <button
            onClick={captureAndAnalyze}
            disabled={cameraState !== 'ready' && cameraState !== 'scanning'}
            style={{
              padding: '14px 28px',
              background: cameraState === 'ready' || cameraState === 'scanning' ? '#0a0a0a' : '#ccc',
              border: 'none',
              borderRadius: '100px',
              color: 'white',
              fontSize: '15px',
              fontWeight: '500',
              cursor: cameraState === 'ready' || cameraState === 'scanning' ? 'pointer' : 'not-allowed',
            }}
          >
            Capture Manually
          </button>
        </div>

        {/* Error State */}
        {cameraState === 'error' && (
          <div style={{
            marginTop: '24px',
            padding: '20px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <p style={{ color: '#dc2626', marginBottom: '12px' }}>
              {statusMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                background: '#0a0a0a',
                border: 'none',
                borderRadius: '100px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
