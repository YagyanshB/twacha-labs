'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StartFreeFlow, { StartFreeFlowData } from '../components/StartFreeFlow';
import UpgradePrompt from '../components/UpgradePrompt';
import ResultsDashboard from '../components/ResultsDashboard';
import SkinAnalysisResults from '../components/SkinAnalysisResults';
import { canAnalyze, incrementUsage, getUserUsage } from '@/lib/usage';

interface AnalysisResult {
  score: number;
  verdict: string;
  analysis: string;
  recommendation: string;
  imagePath?: string | null;
  gagsScore?: number;
  lesionType?: string;
  extractionEligible?: string; // "YES" or "NO"
  activeIngredients?: string[];
  aiConfidence?: number;
  createdAt?: string;
  summary?: string; // User-friendly one-sentence summary
  actionStep?: string; // Clear actionable instruction
  scientificNote?: string; // Technical details for footer
}

interface SkinAnalysisResult {
  overallScore: number;
  skinType: string;
  issues: Array<{
    type: string;
    severity: 'mild' | 'moderate' | 'severe';
    area: string;
    count: number | null;
  }>;
  metrics: {
    hydration: number;
    oilControl: number;
    poreHealth: number;
    texture: number;
    clarity: number;
  };
  recommendations: string[];
  summary: string;
}

export default function AnalysisPage() {
  const router = useRouter();
  const [canProceed, setCanProceed] = useState(true);
  const [usageReason, setUsageReason] = useState('');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [skinAnalysisResult, setSkinAnalysisResult] = useState<SkinAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'syncing' | 'analyzing'>('syncing');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
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

  // Convert image URL to base64 for API
  const imageUrlToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // The StartFreeFlow component handles the camera capture and user data collection
  // This handler is called when the flow completes with user's image and profile data
  const handleFlowComplete = async (data: StartFreeFlowData) => {
    // StartFreeFlow collects: imageUrl, age, skinType
    if (!data.imageUrl) {
      setAnalysisError('No image captured');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setLoadingStage('analyzing');

    try {
      // Convert Supabase URL to base64
      const base64Image = await imageUrlToBase64(data.imageUrl);

      // Call the skin analysis API
      const response = await fetch('/api/analyze-skin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const result: SkinAnalysisResult = await response.json();
      setSkinAnalysisResult(result);

      // Increment usage counter
      const userId = 'temp_user_id';
      incrementUsage(userId);

    } catch (error: any) {
      console.error('Analysis error:', error);
      setAnalysisError(error.message || 'Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleScanAgain = () => {
    setSkinAnalysisResult(null);
    setAnalysisError(null);
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

  // Show analysis results if available
  if (skinAnalysisResult) {
    return (
      <SkinAnalysisResults
        overallScore={skinAnalysisResult.overallScore}
        skinType={skinAnalysisResult.skinType}
        issues={skinAnalysisResult.issues}
        metrics={skinAnalysisResult.metrics}
        recommendations={skinAnalysisResult.recommendations}
        summary={skinAnalysisResult.summary}
        onScanAgain={handleScanAgain}
      />
    );
  }

  // Show error state if analysis failed
  if (analysisError && !isAnalyzing) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '24px',
        background: '#fafafa',
      }}>
        <div style={{
          maxWidth: '500px',
          background: 'white',
          padding: '48px',
          borderRadius: '16px',
          textAlign: 'center',
          border: '1px solid #eee',
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#ef4444',
          }}>
            Analysis Failed
          </h2>
          <p style={{
            fontSize: '15px',
            color: '#666',
            marginBottom: '32px',
            lineHeight: 1.6,
          }}>
            {analysisError}
          </p>
          <button
            onClick={handleScanAgain}
            style={{
              padding: '14px 32px',
              background: '#0a0a0a',
              border: 'none',
              borderRadius: '100px',
              color: 'white',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // The StartFreeFlow component handles the entire flow internally
  // including enhanced camera with face detection, age/skin type collection
  return (
    <StartFreeFlow
      onComplete={handleFlowComplete}
      onBack={() => router.push('/')}
    />
  );
}
