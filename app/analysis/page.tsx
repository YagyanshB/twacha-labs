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

  const getRecommendationFromTriage = (triageLevel: string, extractionEligible: boolean): string => {
    switch (triageLevel) {
      case 'Routine':
        return extractionEligible ? 'Extraction Protocol' : 'Maintenance Routine';
      case 'Monitor':
        return 'Professional Assessment Recommended';
      case 'Referral':
        return 'Professional Consultation Required';
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
      
      // Map new Gemini API response format to component-expected format
      // New format: gags_score, triage_level, extraction_eligible, analysis_summary, ai_confidence
      // Old format: score, verdict, analysis, recommendation
      const mappedResult: AnalysisResult = {
        // Convert GAGS score (0-44) to a 0-100 scale, or use confidence
        score: result.gags_score !== undefined 
          ? Math.round((1 - result.gags_score / 44) * 100) // Invert: lower GAGS = higher score
          : Math.round((result.ai_confidence || 0.7) * 100),
        verdict: result.triage_level || result.verdict || 'UNKNOWN',
        analysis: result.analysis_summary || result.diagnosis || result.skin_summary || 'Analysis completed',
        recommendation: getRecommendationFromTriage(
          result.triage_level || result.verdict || 'UNKNOWN',
          result.extraction_eligible || false
        ),
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
