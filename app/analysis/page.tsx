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
  gagsScore?: number;
  lesionType?: string;
  extractionEligible?: string; // "YES" or "NO"
  activeIngredients?: string[];
  aiConfidence?: number;
  createdAt?: string;
}

export default function AnalysisPage() {
  const router = useRouter();
  const [canProceed, setCanProceed] = useState(true);
  const [usageReason, setUsageReason] = useState('');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'syncing' | 'analyzing'>('syncing');
  
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
    if (!data.imageUrl) return;
    
    // Check usage limit again before analyzing
    const userId = 'temp_user_id'; // TODO: Replace with actual user ID
    const check = canAnalyze(userId);
    
    if (!check.allowed) {
      setShowUpgradePrompt(true);
      return;
    }
    
    setIsAnalyzing(true);
    setLoadingStage('syncing');
    
    try {
      // Stage 1: Syncing to Dermal Vault (image upload is already done, but show this state)
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay to show syncing state
      setLoadingStage('analyzing');
      
      // Stage 2: AI Diagnostic in Progress
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageUrl: data.imageUrl,
          userId: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Clinical Data Sync Error');
      }

      const result = await response.json();
      
      // Increment usage after successful analysis
      incrementUsage(userId);
      const updatedUsage = getUserUsage(userId);
      setAnalysisCount(updatedUsage.analysisCount);
      
      // Map new OpenAI API response format to component-expected format
      // New format: gags_score (1-4), lesion_type, extraction_eligible (YES/NO), triage_level, analysis_summary, active_ingredients, ai_confidence
      // Old format: score, verdict, analysis, recommendation
      const mappedResult: AnalysisResult = {
        // Convert GAGS score (1-4) to a 0-100 scale for display
        score: result.gags_score !== undefined 
          ? Math.round((1 - (result.gags_score - 1) / 3) * 100) // Convert 1-4 to 0-100 (inverted)
          : Math.round((result.ai_confidence || 0.7) * 100),
        verdict: result.triage_level || result.verdict || 'UNKNOWN',
        analysis: result.analysis_summary || result.diagnosis || result.skin_summary || 'Analysis completed',
        recommendation: getRecommendationFromTriage(
          result.triage_level || result.verdict || 'UNKNOWN',
          result.extraction_eligible === 'YES'
        ),
        imagePath: result.imageUrl || result.imagePath || data.imageUrl,
        // Add new fields for clinical report
        gagsScore: result.gags_score,
        lesionType: result.lesion_type,
        extractionEligible: result.extraction_eligible,
        activeIngredients: result.active_ingredients || [],
        aiConfidence: result.ai_confidence,
        createdAt: new Date().toISOString(),
      };
      
      setAnalysisResult(mappedResult);
      setIsAnalyzing(false);
    } catch (error) {
      console.error('Clinical Data Sync Error:', error);
      setIsAnalyzing(false);
      // Show error message with clinical terminology
      alert('Clinical Data Sync Error: Unable to complete analysis. Please try again or contact support.');
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

  // Show loading state with two stages
  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent mb-4" />
          <h2 className="text-2xl font-bold mb-2 font-mono">
            {loadingStage === 'syncing' 
              ? '[SYNCING TO DERMAL VAULT...]'
              : '[AI DIAGNOSTIC IN PROGRESS...]'
            }
          </h2>
          <p className="text-gray-500 font-mono text-sm">
            {loadingStage === 'syncing' 
              ? 'Storing scan image securely...'
              : 'Analyzing with GPT-4o clinical AI...'
            }
          </p>
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
