'use client';

import { useState } from 'react';
import { ArrowLeft, Camera, Upload } from 'lucide-react';
import CameraStep from './StartFreeFlow/CameraStep';
import AgeStep from './StartFreeFlow/AgeStep';
import SkinTypeStep from './StartFreeFlow/SkinTypeStep';
import LoadingStep from './StartFreeFlow/LoadingStep';

export interface StartFreeFlowData {
  image: string | null;
  age: string | null;
  skinType: string | null;
}

interface StartFreeFlowProps {
  onComplete?: (data: StartFreeFlowData) => void;
  onBack?: () => void;
}

export default function StartFreeFlow({ onComplete, onBack }: StartFreeFlowProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<StartFreeFlowData>({
    image: null,
    age: null,
    skinType: null,
  });

  const handleImageCapture = (image: string) => {
    setData({ ...data, image });
    setStep(2);
  };

  const handleAgeSelect = (age: string) => {
    setData({ ...data, age });
    setStep(3);
  };

  const handleSkinTypeSelect = (skinType: string) => {
    const updatedData = { ...data, skinType };
    setData(updatedData);
    setStep(4);
    // Auto-advance to loading after a brief delay
    setTimeout(() => {
      if (onComplete) {
        onComplete(updatedData);
      }
    }, 2000);
  };

  const handleBack = () => {
    if (step === 1) {
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
            <span className="text-sm" style={{ color: isCameraStep ? 'rgba(255, 255, 255, 0.7)' : 'var(--gray)' }}>Step {step} of 3</span>
          </div>
        </div>
      </nav>

      {/* Step Content */}
      <div className={`funnel-content ${isCameraStep ? 'camera-funnel-content' : ''}`}>
        {step === 1 && (
          <CameraStep onCapture={handleImageCapture} onBack={handleBack} />
        )}
        {step === 2 && (
          <AgeStep onSelect={handleAgeSelect} onBack={handleBack} />
        )}
        {step === 3 && (
          <SkinTypeStep onSelect={handleSkinTypeSelect} onBack={handleBack} />
        )}
        {step === 4 && <LoadingStep />}
      </div>
    </div>
  );
}
