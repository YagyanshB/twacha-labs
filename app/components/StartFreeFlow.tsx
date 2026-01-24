'use client';

import { useState } from 'react';
import { ArrowLeft, Camera, Upload } from 'lucide-react';
import CameraStep from './StartFreeFlow/CameraStep';
import AgeStep from './StartFreeFlow/AgeStep';
import SkinTypeStep from './StartFreeFlow/SkinTypeStep';
import LoadingStep from './StartFreeFlow/LoadingStep';

export interface StartFreeFlowData {
  imageUrl: string | null;
  age: string | null;
  skinType: string | null;
}

interface StartFreeFlowProps {
  onComplete?: (data: StartFreeFlowData) => void;
  onBack?: () => void;
}

export default function StartFreeFlow({ onComplete, onBack }: StartFreeFlowProps) {
  const [step, setStep] = useState(0); // Start with camera step (consent removed)
  const [data, setData] = useState<StartFreeFlowData>({
    imageUrl: null,
    age: null,
    skinType: null,
  });

  const handleImageCapture = (imageUrl: string) => {
    setData({ ...data, imageUrl });
    setStep(1);
  };

  const handleAgeSelect = (age: string) => {
    setData({ ...data, age });
    setStep(2);
  };

  const handleSkinTypeSelect = (skinType: string) => {
    const updatedData = { ...data, skinType };
    setData(updatedData);
    setStep(3);
    // Auto-advance to loading after a brief delay
    setTimeout(() => {
      if (onComplete) {
        onComplete(updatedData);
      }
    }, 2000);
  };

  const handleBack = () => {
    if (step === 0) {
      onBack?.();
    } else {
      setStep(step - 1);
    }
  };

  const isCameraStep = step === 1;

  return (
    <div className={`min-h-screen ${isCameraStep ? 'bg-black' : 'bg-white'}`}>
      {/* Navigation - matches landing page */}
      <nav style={{ background: isCameraStep ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)' }}>
        <div className="nav-container">
          <button
            onClick={handleBack}
            className="logo"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <svg className="logo-mark" viewBox="0 0 40 40">
              <g transform="translate(10, 10)" fill={isCameraStep ? "#fff" : "#000"}>
                <circle cx="10" cy="10" r="2"/>
                <circle cx="10" cy="4" r="1.5" opacity="0.8"/>
                <circle cx="16" cy="10" r="1.5" opacity="0.8"/>
                <circle cx="10" cy="16" r="1.5" opacity="0.8"/>
                <circle cx="4" cy="10" r="1.5" opacity="0.8"/>
                <circle cx="6" cy="6" r="1" fill="#0066ff"/>
                <circle cx="14" cy="6" r="1" fill="#0066ff"/>
                <circle cx="14" cy="14" r="1" fill="#0066ff"/>
                <circle cx="6" cy="14" r="1" fill="#0066ff"/>
                <path d="M4 10 L16 10 M10 4 L10 16" stroke={isCameraStep ? "#fff" : "#000"} strokeWidth="0.5" opacity="0.3"/>
              </g>
            </svg>
            <span className="logo-text" style={{ color: isCameraStep ? '#fff' : '#000' }}>Twacha Labs</span>
          </button>
          <div className="nav-right">
            <span className="text-sm" style={{ color: isCameraStep ? 'rgba(255, 255, 255, 0.7)' : 'var(--gray)' }}>
              Step {step + 1} of 4
            </span>
          </div>
        </div>
      </nav>

      {/* Step Content */}
      <div className={`funnel-content ${isCameraStep ? 'camera-funnel-content' : ''}`}>
        {step === 0 && (
          <CameraStep onCapture={handleImageCapture} onBack={handleBack} />
        )}
        {step === 1 && (
          <AgeStep onSelect={handleAgeSelect} onBack={handleBack} />
        )}
        {step === 2 && (
          <SkinTypeStep onSelect={handleSkinTypeSelect} onBack={handleBack} />
        )}
        {step === 3 && <LoadingStep />}
      </div>
    </div>
  );
}
