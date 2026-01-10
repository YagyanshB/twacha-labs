'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, ChevronRight, Check } from 'lucide-react';
import Webcam from 'react-webcam';

interface SkinAnalysisFlowProps {
  onComplete: (data: {
    photo: string;
    skinType: string;
    age: string;
  }) => void;
  onBack?: () => void;
}

export default function SkinAnalysisFlow({ onComplete, onBack }: SkinAnalysisFlowProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    photo: '',
    skinType: '',
    age: '',
  });
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    {
      title: "Take a well-lit photo",
      subtitle: "Front-facing, natural light works best",
      component: (
        <SelfieStep
          photo={formData.photo}
          onPhotoCapture={(photo) => {
            setFormData({ ...formData, photo });
            setStep(1);
          }}
          onPhotoUpload={(photo) => {
            setFormData({ ...formData, photo });
            setStep(1);
          }}
          webcamRef={webcamRef}
          fileInputRef={fileInputRef}
        />
      ),
    },
    {
      title: "What's your skin type?",
      subtitle: "Not sure? We'll help you figure it out.",
      component: (
        <SkinTypeStep
          value={formData.skinType}
          onChange={(val) => setFormData({ ...formData, skinType: val })}
          onNext={() => setStep(2)}
        />
      ),
    },
    {
      title: "Age range",
      component: (
        <AgeStep
          value={formData.age}
          onChange={(val) => {
            setFormData({ ...formData, age: val });
            setTimeout(() => setStep(3), 200);
          }}
        />
      ),
    },
    {
      title: "Quick setup",
      subtitle: "30 seconds to your personalized routine",
      component: (
        <SummaryStep
          onStart={() => onComplete(formData)}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-[448px]">
        {/* Progress bar */}
        <div className="mb-8 flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-200 ${
                i <= step ? 'bg-white' : 'bg-zinc-800'
              }`}
            />
          ))}
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">
                {steps[step].title}
              </h1>
              {steps[step].subtitle && (
                <p className="text-zinc-400 text-sm">
                  {steps[step].subtitle}
                </p>
              )}
            </div>
            
            {steps[step].component}
          </div>
        </div>
      </div>
    </div>
  );
}

// Screen 1: Photo Capture
interface SelfieStepProps {
  photo: string;
  onPhotoCapture: (photo: string) => void;
  onPhotoUpload: (photo: string) => void;
  webcamRef: React.RefObject<Webcam | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

function SelfieStep({ photo, onPhotoCapture, onPhotoUpload, webcamRef, fileInputRef }: SelfieStepProps) {
  const [showCamera, setShowCamera] = useState(false);

  const handleTakePhoto = () => {
    if (webcamRef.current) {
      const screenshot = webcamRef.current.getScreenshot();
      if (screenshot) {
        onPhotoCapture(screenshot);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          onPhotoUpload(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-black rounded-lg p-4 border border-zinc-800">
        {showCamera ? (
          <div className="aspect-square bg-zinc-900 rounded-lg flex items-center justify-center relative overflow-hidden">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
              videoConstraints={{
                facingMode: 'user',
              }}
            />
            {/* Minimal grid overlay */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-zinc-800/50" />
              ))}
            </div>
            {/* Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="w-32 h-32 border-2 border-white/20 rounded-full flex items-center justify-center">
                <Camera className="w-12 h-12 text-white/40" />
              </div>
            </div>
          </div>
        ) : photo ? (
          <div className="aspect-square bg-zinc-900 rounded-lg flex items-center justify-center relative overflow-hidden">
            <img src={photo} alt="Captured" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="aspect-square bg-zinc-900 rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Minimal grid overlay */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-zinc-800/50" />
              ))}
            </div>
            {/* Crosshair */}
            <div className="relative z-10">
              <div className="w-32 h-32 border-2 border-white/20 rounded-full flex items-center justify-center">
                <Camera className="w-12 h-12 text-white/40" />
              </div>
            </div>
          </div>
        )}
        <p className="text-center mt-4 text-sm text-zinc-400">
          Stand in good light, face forward
        </p>
      </div>

      {showCamera ? (
        <button
          onClick={handleTakePhoto}
          className="w-full bg-white text-black py-4 rounded-lg font-medium hover:bg-zinc-100 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Camera className="w-5 h-5" />
          Capture photo
        </button>
      ) : (
        <button
          onClick={() => setShowCamera(true)}
          className="w-full bg-white text-black py-4 rounded-lg font-medium hover:bg-zinc-100 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Camera className="w-5 h-5" />
          Take photo
        </button>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full bg-zinc-800 border border-zinc-700 text-white py-4 rounded-lg font-medium hover:bg-zinc-700 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <Upload className="w-5 h-5" />
        Upload photo
      </button>
    </div>
  );
}

// Screen 2: Skin Type
interface SkinTypeStepProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}

function SkinTypeStep({ value, onChange, onNext }: SkinTypeStepProps) {
  const types = [
    { id: 'dry', label: 'Dry', desc: 'Tight, flaky' },
    { id: 'oily', label: 'Oily', desc: 'Shiny T-zone' },
    { id: 'normal', label: 'Normal', desc: 'Balanced' },
    { id: 'combination', label: 'Combination', desc: 'Mixed zones' },
    { id: 'unknown', label: "Not sure", desc: "We'll detect it" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {types.slice(0, 4).map((type) => (
          <button
            key={type.id}
            onClick={() => onChange(type.id)}
            className={`p-5 rounded-lg border transition-all duration-200 text-left ${
              value === type.id
                ? 'border-white bg-zinc-800'
                : 'border-zinc-800 hover:border-zinc-700 bg-black'
            }`}
          >
            <div className="font-semibold text-white mb-1 text-base">{type.label}</div>
            <div className="text-xs text-zinc-500">{type.desc}</div>
          </button>
        ))}
      </div>
      
      <button
        onClick={() => onChange('unknown')}
        className={`w-full p-5 rounded-lg border transition-all duration-200 text-left ${
          value === 'unknown'
            ? 'border-white bg-zinc-800'
            : 'border-zinc-800 hover:border-zinc-700 bg-black'
        }`}
      >
        <div className="font-semibold text-white mb-1 text-base">{types[4].label}</div>
        <div className="text-xs text-zinc-500">{types[4].desc}</div>
      </button>

      <button
        onClick={onNext}
        disabled={!value}
        className={`w-full py-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
          value
            ? 'bg-white text-black hover:bg-zinc-100'
            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
        }`}
      >
        Continue
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// Screen 3: Age
interface AgeStepProps {
  value: string;
  onChange: (value: string) => void;
}

function AgeStep({ value, onChange }: AgeStepProps) {
  const ranges = [
    { id: '18-24', label: '18-24' },
    { id: '25-29', label: '25-29' },
    { id: '30-35', label: '30-35' },
    { id: '36-40', label: '36-40' },
    { id: '40+', label: '40+' },
  ];

  return (
    <div className="space-y-3">
      {ranges.map((range) => (
        <button
          key={range.id}
          onClick={() => onChange(range.id)}
          className={`w-full p-4 rounded-lg border transition-all duration-200 text-left ${
            value === range.id
              ? 'border-white bg-zinc-800'
              : 'border-zinc-800 hover:border-zinc-700 bg-black'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-white text-base">{range.label}</span>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                value === range.id ? 'border-white bg-white' : 'border-zinc-700'
              }`}
            >
              {value === range.id && (
                <div className="w-2 h-2 bg-black rounded-full"></div>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

// Screen 4: Summary
interface SummaryStepProps {
  onStart: () => void;
}

function SummaryStep({ onStart }: SummaryStepProps) {
  const steps = [
    { title: "Answer 3 questions", time: "10 sec" },
    { title: "Upload your photo", time: "5 sec" },
    { title: "Get your report", time: "15 sec" },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 bg-black rounded-lg border border-zinc-800"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm">
              {i + 1}
            </div>
            <div className="flex-1">
              <div className="font-medium text-white text-base">{step.title}</div>
            </div>
            <div className="text-xs text-zinc-500">{step.time}</div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-400">Total time</span>
          <span className="text-sm font-semibold text-white">~30 seconds</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Check className="w-3 h-3" />
          <span>100K+ men analyzed</span>
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full bg-white text-black py-4 rounded-lg font-medium hover:bg-zinc-100 transition-all duration-200 flex items-center justify-center gap-2"
      >
        Start analysis
        <ChevronRight className="w-5 h-5" />
      </button>

      <button className="w-full text-zinc-400 py-3 rounded-lg font-medium hover:text-white transition-all duration-200 text-sm">
        Already have an account? Login
      </button>
    </div>
  );
}
