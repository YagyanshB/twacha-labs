'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StartFreeFlow, { StartFreeFlowData } from '../components/StartFreeFlow';
import UpgradePrompt from '../components/UpgradePrompt';
import ResultsDashboard from '../components/ResultsDashboard';
import { canAnalyze, incrementUsage, getUserUsage } from '@/lib/usage';

interface AnalysisResult {
  score: number;
  verdict: string;
  analysis: string;
  recommendation: string;
  imagePath?: string | null;
}

export default function AnalysisPage() {
  const router = useRouter();
  const [canProceed, setCanProceed] = useState(true);
  const [usageReason, setUsageReason] = useState('');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
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

  const getRecommendationFromVerdict = (verdict: string): string => {
    switch (verdict) {
      case 'CLEAR':
        return 'Maintenance Routine';
      case 'POP':
        return 'Extraction Protocol';
      case 'STOP':
        return 'Professional Consultation Recommended';
      case 'DOCTOR':
        return 'Professional Evaluation Recommended';
      default:
        return 'The Founder\'s Kit';
    }
  };

  const handleFlowComplete = async (data: StartFreeFlowData) => {
    if (!data.image) return;
    
    // Check usage limit again before analyzing
    const userId = 'temp_user_id'; // TODO: Replace with actual user ID
    const check = canAnalyze(userId);
    
    if (!check.allowed) {
      setShowUpgradePrompt(true);
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // Send to analysis API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          images: [data.image],
          email: null,
          age: data.age,
          skinType: data.skinType,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      
      // Increment usage after successful analysis
      incrementUsage(userId);
      const updatedUsage = getUserUsage(userId);
      setAnalysisCount(updatedUsage.analysisCount);
      
      // Map API response to component-expected format
      const mappedResult: AnalysisResult = {
        score: Math.round((result.confidence || 0.7) * 100),
        verdict: result.verdict || 'UNKNOWN',
        analysis: result.diagnosis || result.skin_summary || 'Analysis completed',
        recommendation: getRecommendationFromVerdict(result.verdict),
        imagePath: result.imagePath || result.imageUrls?.[0] || null,
      };
      
      setAnalysisResult(mappedResult);
      setIsAnalyzing(false);
    } catch (error) {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);
      // Show error message but stay on page
      alert('Analysis failed. Please try again.');
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

  // Show results if analysis is complete
  if (analysisResult) {
    return (
      <ResultsDashboard
        analysisResult={analysisResult}
        email=""
      />
    );
  }

  // Show loading state
  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent mb-4" />
          <h2 className="text-2xl font-bold mb-2">Analyzing your skin...</h2>
          <p className="text-gray-500">This will take a few seconds</p>
        </div>
      </div>
    );
  }

  return (
    <StartFreeFlow
      onComplete={handleFlowComplete}
      onBack={() => router.push('/')}
    />
  );
}
