'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StartFreeFlow, { StartFreeFlowData } from '../components/StartFreeFlow';
import UpgradePrompt from '../components/UpgradePrompt';
import { canAnalyze, incrementUsage, getUserUsage } from '@/lib/usage';

export default function AnalysisPage() {
  const router = useRouter();
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

  const handleFlowComplete = async (data: StartFreeFlowData) => {
    if (!data.image) return;
    
    // Check usage limit again before analyzing
    const userId = 'temp_user_id'; // TODO: Replace with actual user ID
    const check = canAnalyze(userId);
    
    if (!check.allowed) {
      setShowUpgradePrompt(true);
      return;
    }
    
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
      
      // Navigate to results page or handle result
      // For now, redirect to home page
      router.push('/?result=success');
    } catch (error) {
      console.error('Analysis error:', error);
      // Show error and allow retry
      router.push('/?error=analysis_failed');
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
    <StartFreeFlow
      onComplete={handleFlowComplete}
      onBack={() => router.push('/')}
    />
  );
}
