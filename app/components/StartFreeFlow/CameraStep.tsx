'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Check, Image as ImageIcon, X } from 'lucide-react';
import Webcam from 'react-webcam';

interface CameraStepProps {
  onCapture: (image: string) => void;
  onBack: () => void;
}

type Mode = 'camera' | 'upload';

export default function CameraStep({ onCapture, onBack }: CameraStepProps) {
  const [mode, setMode] = useState<Mode>('camera');
  const [faceDetected, setFaceDetected] = useState(false);
  const [centered, setCentered] = useState(false);
  const [goodLighting, setGoodLighting] = useState(false);
  const [correctDistance, setCorrectDistance] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

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

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setCapturedImage(result);
        onCapture(result);
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
    if (mode === 'camera') {
      simulateConditions();
    }
  }, [mode]);

  const handleRetake = () => {
    setCapturedImage(null);
    setPreviewImage(null);
    if (mode === 'camera') {
      simulateConditions();
    }
  };

  return (
    <div className="camera-step">
      <div className="camera-step-content">
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
        )}

        {/* Action Buttons */}
        <div className="camera-actions">
          {mode === 'camera' ? (
            <>
              {!capturedImage ? (
                <button
                  onClick={handleCapture}
                  disabled={!allConditionsMet}
                  className={`primary-cta camera-button ${!allConditionsMet ? 'disabled' : ''}`}
                >
                  <Camera className="button-icon" />
                  Capture photo
                </button>
              ) : (
                <button
                  onClick={handleRetake}
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
                  className="primary-cta camera-button"
                >
                  <Upload className="button-icon" />
                  Choose photo
                </button>
              ) : (
                <button
                  onClick={handleRetake}
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
