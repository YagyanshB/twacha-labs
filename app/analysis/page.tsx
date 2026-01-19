'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HybridScanFlow from '../components/HybridScanFlow';
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
  summary?: string; // User-friendly one-sentence summary
  actionStep?: string; // Clear actionable instruction
  scientificNote?: string; // Technical details for footer
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

  // The HybridScanFlow component handles its own analysis flow
  // This handler is called when the flow completes (after email submission)
  const handleFlowComplete = async (data: { imageUrl: string; email?: string }) => {
    // The hybrid flow already handles analysis internally
    // This is just for any post-completion logic if needed
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

  // The HybridScanFlow component handles the entire flow internally
  // including analysis, results preview, and email gate
  return (
    <HybridScanFlow
      onComplete={handleFlowComplete}
      onBack={() => router.push('/')}
    />
  );
}
