'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CameraCapture from './components/CameraCapture';
import UpgradePrompt from '../components/UpgradePrompt';
import { canAnalyze, incrementUsage, getUserUsage } from '@/lib/usage';

export default function AnalysisPage() {
  const router = useRouter();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [step, setStep] = useState<'capture' | 'preview' | 'analyzing'>('capture');
  const [canProceed, setCanProceed] = useState(true);
  const [usageReason, setUsageReason] = useState('');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [analysisCount, setAnalysisCount] = useState(0);
  
  useEffect(() => {
    // Check usage limit (replace with real user ID from auth)
    const userId = 'temp_user_id'; // TODO: Replace with actual user ID from auth
    const check = canAnalyze(userId);
    const usage = getUserUsage(userId);
    
    setCanProceed(check.allowed);
    setAnalysisCount(usage.analysisCount);
    if (!check.allowed) {
      setUsageReason(check.reason || '');
      setShowUpgradePrompt(true);
    }
  }, []);

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setStep('preview');
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setStep('capture');
  };

  const handleAnalyze = async () => {
    if (!capturedImage) return;
    
    // Check usage limit again before analyzing
    const userId = 'temp_user_id'; // TODO: Replace with actual user ID
    const check = canAnalyze(userId);
    
    if (!check.allowed) {
      setShowUpgradePrompt(true);
      return;
    }
    
    setStep('analyzing');
    
    try {
      // Send to analysis API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          images: [capturedImage],
          email: null 
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      
      // Increment usage after successful analysis
      incrementUsage(userId);
      const updatedUsage = getUserUsage(userId);
      setAnalysisCount(updatedUsage.analysisCount);
      
      // Navigate to results page or handle result
      // For now, redirect to home page
      router.push('/?result=success');
    } catch (error) {
      console.error('Analysis error:', error);
      // Show error and allow retry
      setStep('preview');
    }
  };

  if (showUpgradePrompt && !canProceed) {
    return (
      <UpgradePrompt 
        variant="limit-reached"
        analysisCount={analysisCount}
        onClose={() => router.push('/')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-zinc-900 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Skin Analysis</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {step === 'capture' && (
          <div>
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Take your photo</h2>
              <p className="text-zinc-400">Position your face for the best results</p>
            </div>
            <CameraCapture onCapture={handleCapture} />
          </div>
        )}

        {step === 'preview' && capturedImage && (
          <div>
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold mb-2">How does it look?</h2>
              <p className="text-zinc-400">Make sure your face is clear and well-lit</p>
            </div>
            
            <div className="max-w-md mx-auto">
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full rounded-xl"
              />
              
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleAnalyze}
                  className="w-full bg-white text-black py-4 rounded-lg font-semibold hover:bg-zinc-100 transition-all duration-200"
                >
                  Analyze my skin
                </button>
                <button
                  onClick={handleRetake}
                  className="w-full bg-zinc-800 text-white py-4 rounded-lg font-semibold hover:bg-zinc-700 transition-all duration-200"
                >
                  Retake photo
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-zinc-800 border-t-white mb-4" />
            <h2 className="text-2xl font-bold mb-2">Analyzing your skin...</h2>
            <p className="text-zinc-400">This will take a few seconds</p>
          </div>
        )}
      </div>
    </div>
  );
}
