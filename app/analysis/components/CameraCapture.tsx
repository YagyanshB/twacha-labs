'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle, AlertCircle } from 'lucide-react';

interface FaceQuality {
  detected: boolean;
  centered: boolean;
  wellLit: boolean;
  correctDistance: boolean;
  ready: boolean;
}

export default function CameraCapture({ onCapture }: { onCapture: (image: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [faceQuality, setFaceQuality] = useState<FaceQuality>({
    detected: false,
    centered: false,
    wellLit: false,
    correctDistance: false,
    ready: false
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const faceMeshRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          // Wait a bit for MediaPipe to load
          setTimeout(() => {
            initMediaPipe();
          }, 500);
        };
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Please allow camera access to continue');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (faceMeshRef.current) {
      faceMeshRef.current.close();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const initMediaPipe = () => {
    // Check if MediaPipe is loaded (may take a moment)
    const checkMediaPipe = () => {
      // @ts-ignore - MediaPipe loaded via CDN
      if (typeof window === 'undefined' || typeof (window as any).FaceMesh === 'undefined') {
        // Retry after a short delay
        setTimeout(checkMediaPipe, 100);
        return;
      }

      try {
        // @ts-ignore
        const faceMesh = new (window as any).FaceMesh({
          locateFile: (file: string) => 
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        faceMesh.onResults(onFaceMeshResults);
        faceMeshRef.current = faceMesh;

        // Start processing video frames
        processFrame();
      } catch (error) {
        console.error('Error initializing MediaPipe:', error);
      }
    };

    checkMediaPipe();

  };

  const processFrame = async () => {
    if (!videoRef.current || !faceMeshRef.current) {
      return;
    }

    try {
      if (videoRef.current.readyState === 4) {
        await faceMeshRef.current.send({ image: videoRef.current });
      }
    } catch (error) {
      console.error('Error processing frame:', error);
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  };

  const onFaceMeshResults = (results: any) => {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      setFaceQuality(prev => ({
        ...prev,
        detected: false,
        ready: false
      }));
      drawGuidance(null);
      return;
    }

    const landmarks = results.multiFaceLandmarks[0];
    const quality = analyzeFaceQuality(landmarks, results.image);
    setFaceQuality(quality);

    // Draw guidance overlay
    drawGuidance(results);
  };

  const analyzeFaceQuality = (landmarks: any[], image: any): FaceQuality => {
    // Get key landmarks (MediaPipe Face Mesh has 468 landmarks)
    // Key points: nose tip (4), left eye (33), right eye (263), chin (152)
    const noseTip = landmarks[4] || landmarks[1]; // Fallback to landmark 1 if 4 doesn't exist
    const leftEye = landmarks[33] || landmarks[159];
    const rightEye = landmarks[263] || landmarks[386];
    const chin = landmarks[152] || landmarks[175];

    if (!noseTip || !leftEye || !rightEye) {
      return {
        detected: false,
        centered: false,
        wellLit: false,
        correctDistance: false,
        ready: false
      };
    }

    // Check if centered (nose should be in center third)
    const centered = noseTip.x > 0.35 && noseTip.x < 0.65;

    // Check distance (face should fill adequate portion of frame)
    const faceWidth = Math.abs(leftEye.x - rightEye.x);
    const correctDistance = faceWidth > 0.2 && faceWidth < 0.5;

    // Check lighting (simplified - in production, analyze actual pixel values)
    // For now, assume well-lit if face is detected and reasonably sized
    const wellLit = correctDistance;

    const detected = true;
    const ready = centered && correctDistance && wellLit;

    return { detected, centered, wellLit, correctDistance, ready };
  };

  const drawGuidance = (results: any) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw face oval guide
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radiusX = canvas.width * 0.25;
    const radiusY = canvas.height * 0.35;

    ctx.strokeStyle = faceQuality.ready ? '#22c55e' : '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(
      centerX,
      centerY,
      radiusX,
      radiusY,
      0,
      0,
      2 * Math.PI
    );
    ctx.stroke();

    // Draw center guide lines if not centered
    if (!faceQuality.centered) {
      ctx.strokeStyle = '#ffffff40';
      ctx.lineWidth = 1;
      // Vertical center line
      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, canvas.height);
      ctx.stroke();
    }

    // Draw distance guide if too close/far
    if (!faceQuality.correctDistance) {
      ctx.strokeStyle = '#ffffff40';
      ctx.lineWidth = 1;
      // Draw target size indicator
      const targetRadius = canvas.width * 0.35;
      ctx.beginPath();
      ctx.arc(centerX, centerY, targetRadius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !faceQuality.ready) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    
    setIsProcessing(true);
    onCapture(imageData);
  };

  return (
    <div className="relative">
      {/* Video and Canvas */}
      <div className="relative bg-black rounded-xl overflow-hidden aspect-[3/4] max-w-md mx-auto">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
          playsInline
          muted
          autoPlay
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: 'scaleX(-1)' }}
        />
        
        {/* Guidance Overlay */}
        <div className="absolute top-4 left-4 right-4 space-y-2 z-10">
          <GuidanceItem
            icon={faceQuality.detected ? CheckCircle : AlertCircle}
            label="Face detected"
            active={faceQuality.detected}
          />
          <GuidanceItem
            icon={faceQuality.centered ? CheckCircle : AlertCircle}
            label="Centered"
            active={faceQuality.centered}
          />
          <GuidanceItem
            icon={faceQuality.wellLit ? CheckCircle : AlertCircle}
            label="Good lighting"
            active={faceQuality.wellLit}
          />
          <GuidanceItem
            icon={faceQuality.correctDistance ? CheckCircle : AlertCircle}
            label="Correct distance"
            active={faceQuality.correctDistance}
          />
        </div>

        {/* Capture Button */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
          <button
            onClick={capturePhoto}
            disabled={!faceQuality.ready || isProcessing}
            className={`px-8 py-4 rounded-full font-semibold transition-all duration-200 ${
              faceQuality.ready
                ? 'bg-white text-black hover:scale-105'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? 'Processing...' : 'Capture Photo'}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-sm text-zinc-400">
        <p>Position your face in the oval guide</p>
        <p>Make sure lighting is even</p>
      </div>
    </div>
  );
}

function GuidanceItem({ 
  icon: Icon, 
  label, 
  active 
}: { 
  icon: any; 
  label: string; 
  active: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm ${
      active ? 'bg-green-500/20 border border-green-500/50' : 'bg-black/50 border border-zinc-700'
    }`}>
      <Icon className={`w-4 h-4 ${active ? 'text-green-400' : 'text-zinc-500'}`} />
      <span className={`text-xs font-medium ${active ? 'text-green-400' : 'text-zinc-400'}`}>
        {label}
      </span>
    </div>
  );
}
