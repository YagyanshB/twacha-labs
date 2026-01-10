'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Check } from 'lucide-react';
import Webcam from 'react-webcam';

interface CameraStepProps {
  onCapture: (image: string) => void;
  onBack: () => void;
}

export default function CameraStep({ onCapture, onBack }: CameraStepProps) {
  const [faceDetected, setFaceDetected] = useState(false);
  const [centered, setCentered] = useState(false);
  const [goodLighting, setGoodLighting] = useState(false);
  const [correctDistance, setCorrectDistance] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allConditionsMet = faceDetected && centered && goodLighting && correctDistance;

  const handleCapture = () => {
    if (webcamRef.current && allConditionsMet) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        onCapture(imageSrc);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCapturedImage(result);
        onCapture(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Simulate face detection conditions (UI only - no actual detection)
  const simulateConditions = () => {
    setFaceDetected(false);
    setCentered(false);
    setGoodLighting(false);
    setCorrectDistance(false);
    setTimeout(() => setFaceDetected(true), 500);
    setTimeout(() => setCentered(true), 1000);
    setTimeout(() => setGoodLighting(true), 1500);
    setTimeout(() => setCorrectDistance(true), 2000);
  };

  useEffect(() => {
    simulateConditions();
  }, []);

  return (
    <div className="camera-step">
      <div className="camera-step-content">
        {/* Title */}
        <div className="funnel-header">
          <h1>Take your photo</h1>
          <p>Position your face for the best results</p>
        </div>

        {/* Camera View */}
        <div className="camera-view">
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
              
              {/* Face Guide Overlay */}
              <div className="face-guide">
                <div className="face-guide-oval"></div>
              </div>
            </>
          ) : (
            <img src={capturedImage} alt="Captured" className="captured-image" />
          )}
        </div>

        {/* Checklist */}
        <div className="checklist">
          <ChecklistItem
            label="Face detected"
            checked={faceDetected}
          />
          <ChecklistItem
            label="Centered"
            checked={centered}
          />
          <ChecklistItem
            label="Good lighting"
            checked={goodLighting}
          />
          <ChecklistItem
            label="Correct distance"
            checked={correctDistance}
          />
        </div>

        {/* Action Buttons */}
        <div className="camera-actions">
          {!capturedImage ? (
            <>
              <button
                onClick={handleCapture}
                disabled={!allConditionsMet}
                className={`primary-cta camera-button ${!allConditionsMet ? 'disabled' : ''}`}
              >
                <Camera className="button-icon" />
                Capture photo
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="secondary-cta camera-button"
              >
                <Upload className="button-icon" />
                Upload from gallery
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </>
          ) : (
            <button
              onClick={() => {
                setCapturedImage(null);
                simulateConditions();
              }}
              className="secondary-cta camera-button"
            >
              Retake photo
            </button>
          )}
        </div>

        {/* Helper Text */}
        <p className="helper-text">
          Stand in good light, face forward, and keep your phone at arm's length
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
