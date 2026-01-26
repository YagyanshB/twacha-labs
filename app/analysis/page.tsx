'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StartFreeFlow, { StartFreeFlowData } from '../components/StartFreeFlow';
import UpgradePrompt from '../components/UpgradePrompt';
import ResultsDashboard from '../components/ResultsDashboard';
import SkinAnalysisResults from '../components/SkinAnalysisResults';
import { canAnalyze, incrementUsage, getUserUsage } from '@/lib/usage';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';

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
  image_quality: {
    score: number;
    status: 'pass' | 'limited' | 'fail';
    issues: string[];
    usable_zones?: string[];
    unusable_zones?: Array<{ zone: string; reason: string }>;
  };
  analysis: {
    overall_score: number;
    skin_type: string;
    confidence: 'high' | 'medium' | 'low';
    metrics: {
      hydration: { score: number; confidence: string } | number;
      oil_control: { score: number; confidence: string } | number;
      pore_health: { score: number; confidence: string } | number;
      texture: { score: number; confidence: string } | number;
      clarity: { score: number; confidence: string } | number;
    };
    issues_detected: Array<{
      type: string;
      severity: 'mild' | 'moderate' | 'severe';
      location: string;
      confidence: string;
      count: number | null;
    }>;
    recommendations: string[];
  };
  upsell: {
    show_pro_kit: boolean;
    reason?: string;
    message?: string;
  };
  summary: string;
}

export default function AnalysisPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
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

  // Extract ingredient names from recommendation text
  const extractIngredient = (recommendation: string): string | null => {
    const ingredients = [
      'salicylic acid',
      'niacinamide',
      'hyaluronic acid',
      'retinol',
      'benzoyl peroxide',
      'glycolic acid',
      'vitamin c',
      'ceramides',
      'peptides',
      'zinc',
    ];

    const lowerRec = recommendation.toLowerCase();
    for (const ingredient of ingredients) {
      if (lowerRec.includes(ingredient)) {
        return ingredient;
      }
    }
    return null;
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

      // Call the skin analysis API (works for anonymous users)
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

      // Display results immediately (works for anonymous users)
      setSkinAnalysisResult(result);

      // If user is logged in, save to database
      if (!user) {
        console.log('Anonymous scan - results shown but not saved to database');
        // User will be prompted to login when they want to save or view dashboard
        return;
      }

      // Save scan to database with full analysis data
      const { data: scan, error: scanError } = await supabase
        .from('scans')
        .insert({
          user_id: user.id,
          image_url: data.imageUrl,
          status: 'completed',
          overall_score: result.analysis.overall_score,
          hydration_score: typeof result.analysis.metrics.hydration === 'object'
            ? result.analysis.metrics.hydration.score
            : result.analysis.metrics.hydration,
          oil_control_score: typeof result.analysis.metrics.oil_control === 'object'
            ? result.analysis.metrics.oil_control.score
            : result.analysis.metrics.oil_control,
          pore_health_score: typeof result.analysis.metrics.pore_health === 'object'
            ? result.analysis.metrics.pore_health.score
            : result.analysis.metrics.pore_health,
          texture_score: typeof result.analysis.metrics.texture === 'object'
            ? result.analysis.metrics.texture.score
            : result.analysis.metrics.texture,
          clarity_score: typeof result.analysis.metrics.clarity === 'object'
            ? result.analysis.metrics.clarity.score
            : result.analysis.metrics.clarity,
          skin_type: result.analysis.skin_type,
          summary: result.summary,
          analysis: result, // Store full GPT-4o response as jsonb
          analyzed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (scanError) {
        console.error('Failed to save scan:', scanError);
        throw new Error('Failed to save scan results');
      }

      // Save issues to database
      if (result.analysis.issues_detected && result.analysis.issues_detected.length > 0) {
        const issues = result.analysis.issues_detected.map((issue) => ({
          scan_id: scan.id,
          issue_type: issue.type.toLowerCase().replace(/\s+/g, '_'),
          severity: issue.severity,
          location: issue.location,
          count: issue.count,
        }));

        const { error: issuesError } = await supabase
          .from('scan_issues')
          .insert(issues);

        if (issuesError) {
          console.error('Failed to save issues:', issuesError);
        }
      }

      // Save recommendations to database
      if (result.analysis.recommendations && result.analysis.recommendations.length > 0) {
        const recommendations = result.analysis.recommendations.map((rec, i) => ({
          scan_id: scan.id,
          priority: i === 0 ? 'high' : i === 1 ? 'medium' : 'low',
          title: rec,
          description: rec,
          // Extract ingredient from recommendation text if present
          ingredient: extractIngredient(rec),
        }));

        const { error: recsError } = await supabase
          .from('recommendations')
          .insert(recommendations);

        if (recsError) {
          console.error('Failed to save recommendations:', recsError);
        }
      }

      // Note: Profile stats (total_scans, current_streak) are auto-updated by database trigger
      // CRITICAL: Update monthly_scans_used counter for scan allowance
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('monthly_scans_used, total_scans')
        .eq('id', user.id)
        .single();

      if (currentProfile) {
        await supabase
          .from('profiles')
          .update({
            monthly_scans_used: (currentProfile.monthly_scans_used || 0) + 1,
            total_scans: (currentProfile.total_scans || 0) + 1,
            last_scan_date: new Date().toISOString().split('T')[0],
          })
          .eq('id', user.id);
      }

      // Increment local usage counter for UI
      incrementUsage(user.id);

      // Display results
      setSkinAnalysisResult(result);

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
        overallScore={skinAnalysisResult.analysis.overall_score}
        skinType={skinAnalysisResult.analysis.skin_type}
        issues={skinAnalysisResult.analysis.issues_detected}
        metrics={skinAnalysisResult.analysis.metrics}
        recommendations={skinAnalysisResult.analysis.recommendations}
        summary={skinAnalysisResult.summary}
        imageQuality={skinAnalysisResult.image_quality}
        analysisData={skinAnalysisResult.analysis}
        upsell={skinAnalysisResult.upsell}
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
