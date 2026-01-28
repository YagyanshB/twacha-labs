'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { useScanAllowance } from '@/hooks/useScanAllowance';
import { useRealtimeScores } from '@/hooks/useRealtimeScores';
import ScanButton from '@/app/components/ScanButton';
import LowScansWarning from '@/app/components/LowScansWarning';
import UpgradeModal from '@/app/components/UpgradeModal';
import AIChatModal from '@/app/components/AIChatModal';
import ScanReminderSettings from '@/app/components/ScanReminderSettings';
import SkinGoalsSettings from '@/app/components/SkinGoalsSettings';
import ComingSoonModal from '@/app/components/ComingSoonModal';

// Twacha Labs - Men's Skin Health Dashboard
// Designed for the first 200 beta users
// Features: Overall skin score, issue detection, progress tracking, actionable insights

// Issue details database
const issueDetailsDatabase: Record<string, { what: string; why: string; tips: string[] }> = {
  'oily_zones': {
    what: 'Excess sebum production causing shine, particularly in the T-zone area.',
    why: 'This can be caused by genetics, hormones, humidity, or using products that strip natural oils.',
    tips: [
      'Use a gentle, non-stripping cleanser twice daily',
      'Look for products with niacinamide to regulate oil',
      'Avoid over-washing which can increase oil production',
      'Use oil-free, non-comedogenic moisturizers',
    ],
  },
  'dark_spots': {
    what: 'Areas of hyperpigmentation where melanin has concentrated.',
    why: 'Often caused by sun exposure, acne scarring, or skin inflammation.',
    tips: [
      'Apply SPF 30+ daily, even on cloudy days',
      'Consider vitamin C serum in your morning routine',
      'Be patient - fading takes 3-6 months of consistent care',
      'Avoid picking at skin which can worsen spots',
    ],
  },
  'enlarged_pores': {
    what: 'Visibly larger pore openings, most common on nose and cheeks.',
    why: 'Caused by excess oil, loss of skin elasticity, or clogged pores stretching.',
    tips: [
      'Use salicylic acid to keep pores clear',
      'Retinol can help improve pore appearance over time',
      'Regular gentle exfoliation prevents buildup',
      'Clay masks once a week can help minimize appearance',
    ],
  },
  'acne': {
    what: 'Inflammatory skin condition with pimples, blackheads, or cysts.',
    why: 'Caused by clogged pores, bacteria, excess oil, and inflammation.',
    tips: [
      'Use benzoyl peroxide or salicylic acid treatments',
      'Avoid touching or picking at blemishes',
      'Change pillowcases regularly',
      'Consider seeing a dermatologist for persistent acne',
    ],
  },
  'dry_patches': {
    what: 'Areas of flaky, rough, or dehydrated skin.',
    why: 'Can be caused by weather, harsh products, or lack of moisture barrier protection.',
    tips: [
      'Use a gentle, hydrating cleanser',
      'Apply moisturizer to damp skin to lock in hydration',
      'Look for ingredients like hyaluronic acid and ceramides',
      'Avoid hot water and harsh soaps',
    ],
  },
};

// Clinical SVG icons for recommendations
function getRecommendationIcon(title: string, ingredient?: string): React.ReactNode {
  const titleLower = (title || '').toLowerCase();
  const ingredientLower = (ingredient || '').toLowerCase();

  // Check for specific keywords to determine icon type
  if (titleLower.includes('cleanser') || titleLower.includes('wash') || titleLower.includes('clean')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="1.5">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.82-.13 2.68-.37"/>
        <path d="M12 6v6l4 2"/>
        <circle cx="19" cy="19" r="3"/>
      </svg>
    );
  }

  if (titleLower.includes('serum') || ingredientLower.includes('niacinamide') || ingredientLower.includes('vitamin c') || titleLower.includes('treatment')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="1.5">
        <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
        <path d="M12 18a6 6 0 0 0 0-12v12z"/>
      </svg>
    );
  }

  if (titleLower.includes('moisturizer') || titleLower.includes('hydrat') || titleLower.includes('cream')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="1.5">
        <path d="M12 22c6 0 8-4 8-10S14 2 12 2"/>
        <path d="M12 22c-6 0-8-4-8-10S10 2 12 2"/>
        <path d="M12 2v20"/>
      </svg>
    );
  }

  if (titleLower.includes('spf') || titleLower.includes('sunscreen') || titleLower.includes('sun')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="1.5">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    );
  }

  if (titleLower.includes('exfoliat') || titleLower.includes('peel') || ingredientLower.includes('aha') || ingredientLower.includes('bha')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v8"/>
        <path d="M8 12h8"/>
      </svg>
    );
  }

  // Default icon for general recommendations
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4"/>
      <path d="M12 8h.01"/>
    </svg>
  );
}

export default function TwachaDashboard() {
  const { user, loading, signOut } = useUser();
  const router = useRouter();
  const { scansUsed, scansRemaining, isPremium, canScan, limit, refresh } = useScanAllowance();
  const {
    overallScore,
    overallChange,
    metrics,
    stats,
    detectedIssues,
    isLoading: scoresLoading,
    latestScan,
  } = useRealtimeScores(user?.id);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedScan, setSelectedScan] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showAIChatModal, setShowAIChatModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState<'report' | 'ai' | null>(null);

  // Real data from database
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoadingExtras, setIsLoadingExtras] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [expandedRec, setExpandedRec] = useState<string | null>(null);
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch dashboard data (scan history and recommendations)
  const fetchDashboardData = async (userId: string) => {
    setIsLoadingExtras(true);

    const { supabase } = await import('@/lib/supabase');

    try {
      // Fetch user profile for fresh name data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileData) {
        setProfile(profileData);
      }
      // Get scan history for progress chart (last 10 scans)
      const { data: historyData } = await supabase
        .from('scans')
        .select('id, overall_score, hydration_score, oil_control_score, pore_health_score, texture_score, clarity_score, created_at')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (historyData && historyData.length > 0) {
        // Format for chart (reverse to show oldest first)
        const formatted = historyData.reverse().map(scan => ({
          date: new Date(scan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          score: scan.overall_score,
          hydration: scan.hydration_score,
          oilControl: scan.oil_control_score,
          poreHealth: scan.pore_health_score,
          texture: scan.texture_score,
          clarity: scan.clarity_score,
        }));
        setScanHistory(formatted);
      }

      // Get recommendations from latest scan
      if (latestScan?.id) {
        const { data: recsData } = await supabase
          .from('recommendations')
          .select('*')
          .eq('scan_id', latestScan.id)
          .order('priority', { ascending: true });

        if (recsData && recsData.length > 0) {
          // Format recommendations for display with clinical SVG icons
          const formatted = recsData.map((rec, idx) => ({
            id: rec.id,
            priority: rec.priority === 1 ? 'high' : 'medium',
            title: rec.title,
            description: rec.description,
            action: rec.priority === 1 ? 'Add to routine' : 'Learn more',
            icon: getRecommendationIcon(rec.title, rec.ingredient),
          }));
          setRecommendations(formatted);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoadingExtras(false);
    }
  };

  // Fetch data when user is available
  useEffect(() => {
    if (user?.id) {
      fetchDashboardData(user.id);
    }
  }, [user?.id, latestScan?.id]);

  // Real-time subscription for new scans
  useEffect(() => {
    if (!user?.id) return;

    const setupRealtimeSubscription = async () => {
      const { supabase } = await import('@/lib/supabase');

      const channel = supabase
        .channel('dashboard-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'scans',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            // Refresh dashboard data when new scan is added
            fetchDashboardData(user.id);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'recommendations',
          },
          () => {
            // Refresh recommendations when new ones are added
            fetchDashboardData(user.id);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            // Update profile when name or other profile data changes
            console.log('Profile updated:', payload.new);
            setProfile(payload.new);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeSubscription();
  }, [user?.id]);

  const handleNewScan = () => {
    if (!canScan) {
      // No scans left - show upgrade modal
      setShowUpgradeModal(true);
    } else if (scansRemaining === 1) {
      // Last scan - show warning first
      setShowWarningModal(true);
    } else {
      // Has scans - proceed to scan
      router.push('/analysis');
    }
  };

  const proceedToScan = () => {
    setShowWarningModal(false);
    router.push('/analysis');
  };

  if (loading || !user || scoresLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600 font-light">Loading...</div>
      </div>
    );
  }

  // Real user data from hooks
  const userData = {
    name: profile?.full_name || user.email?.split('@')[0] || 'User',
    memberSince: stats.memberSince || new Date(user.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    totalScans: stats.totalScans || 0,
    streak: stats.currentStreak || 0,
  };

  // Real skin score and metrics from latest scan
  const currentScore = {
    overall: overallScore || 0,
    previousOverall: (overallScore - overallChange) || 0,
    breakdown: {
      hydration: {
        score: metrics.hydration.score,
        status: metrics.hydration.change > 0 ? 'improving' : metrics.hydration.change < 0 ? 'needs-attention' : 'stable',
        change: metrics.hydration.change
      },
      oilControl: {
        score: metrics.oilControl.score,
        status: metrics.oilControl.change > 0 ? 'improving' : metrics.oilControl.change < 0 ? 'needs-attention' : 'stable',
        change: metrics.oilControl.change
      },
      poreHealth: {
        score: metrics.poreHealth.score,
        status: metrics.poreHealth.change > 0 ? 'improving' : metrics.poreHealth.change < 0 ? 'needs-attention' : 'stable',
        change: metrics.poreHealth.change
      },
      texture: {
        score: metrics.texture.score,
        status: metrics.texture.change > 0 ? 'improving' : metrics.texture.change < 0 ? 'needs-attention' : 'stable',
        change: metrics.texture.change
      },
      clarity: {
        score: metrics.clarity.score,
        status: metrics.clarity.change > 0 ? 'improving' : metrics.clarity.change < 0 ? 'needs-attention' : 'stable',
        change: metrics.clarity.change
      },
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#0a0a0a';
    return '#ef4444';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving' || trend === 'decreasing') return '↑';
    if (trend === 'needs-attention' || trend === 'increasing') return '↓';
    return '→';
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'improving' || trend === 'decreasing') return '#22c55e';
    if (trend === 'needs-attention' || trend === 'increasing') return '#ef4444';
    return '#888';
  };

  const getSeverityBadge = (severity: string) => {
    const styles: Record<string, { bg: string; color: string; text: string }> = {
      mild: { bg: '#f0fdf4', color: '#166534', text: 'Mild' },
      moderate: { bg: '#fef9c3', color: '#854d0e', text: 'Moderate' },
      severe: { bg: '#fef2f2', color: '#991b1b', text: 'Severe' },
    };
    return styles[severity] || styles.mild;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafafa',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: '#0a0a0a',
    }}>
      {/* Header */}
      <header style={{
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
        background: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.7 }}>
            <circle cx="6" cy="6" r="2" fill="#0a0a0a"/>
            <circle cx="18" cy="6" r="2" fill="#0a0a0a"/>
            <circle cx="6" cy="18" r="2" fill="#0a0a0a"/>
            <circle cx="18" cy="18" r="2" fill="#0a0a0a"/>
            <circle cx="12" cy="12" r="2" fill="#0a0a0a"/>
          </svg>
          <span style={{ fontSize: '17px', fontWeight: '600', letterSpacing: '-0.01em' }}>
            Twacha Labs
          </span>
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ScanButton
            scansUsed={scansUsed}
            scansLimit={limit}
            isPremium={isPremium}
            onScan={handleNewScan}
            onUpgrade={() => setShowUpgradeModal(true)}
          />

          {/* Settings Icon */}
          <div
            onClick={() => router.push('/dashboard/settings')}
            title="Settings"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          </div>

          {/* User Avatar */}
          <div
            onClick={() => router.push('/dashboard/settings')}
            title="Profile"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#0a0a0a',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}>
            {userData.name[0].toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(10px)',
        transition: 'all 0.4s ease-out',
      }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '600',
            letterSpacing: '-0.02em',
            marginBottom: '8px',
          }}>
            Welcome back, {userData.name}
          </h1>
          <p style={{ color: '#666', fontSize: '15px' }}>
            You're on a {userData.streak}-day streak. Keep it up!
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '32px',
          borderBottom: '1px solid #eee',
          paddingBottom: '0',
        }}>
          {['overview', 'issues', 'progress', 'recommendations'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 20px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #0a0a0a' : '2px solid transparent',
                color: activeTab === tab ? '#0a0a0a' : '#888',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                textTransform: 'capitalize',
                marginBottom: '-1px',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div style={{ animation: 'fade-in 0.3s ease-out' }}>
            {/* Show welcome message if no scans yet */}
            {overallScore === 0 && stats.totalScans === 0 ? (
              <div style={{
                background: 'white',
                border: '1px solid #eee',
                borderRadius: '16px',
                padding: '48px',
                textAlign: 'center',
                marginBottom: '24px',
              }}>
                <div style={{ fontSize: '64px', marginBottom: '24px' }}>👋</div>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>
                  Welcome to Twacha Labs
                </h2>
                <p style={{ color: '#666', fontSize: '15px', marginBottom: '32px', lineHeight: 1.6 }}>
                  Start your skin health journey by taking your first scan. Our AI will analyze your skin and provide personalized recommendations.
                </p>
                <button
                  onClick={handleNewScan}
                  style={{
                    padding: '16px 32px',
                    background: '#0a0a0a',
                    border: 'none',
                    borderRadius: '100px',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  Take Your First Scan
                </button>
              </div>
            ) : (
              <>
                {/* Score Cards Row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px',
                }}>
                  {/* Main Skin Score Card */}
                  <div style={{
                    background: 'white',
                    border: '1px solid #eee',
                    borderRadius: '16px',
                    padding: '28px',
                    gridColumn: 'span 1',
                  }}>
                    <div style={{ fontSize: '13px', color: '#888', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Your Skin Score
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '12px' }}>
                      <span style={{
                        fontSize: '64px',
                        fontWeight: '700',
                        letterSpacing: '-0.03em',
                        lineHeight: 1,
                        color: getScoreColor(currentScore.overall),
                      }}>
                        {currentScore.overall}
                      </span>
                      <span style={{ fontSize: '24px', color: '#ccc', marginBottom: '8px' }}>/100</span>
                    </div>
                    {overallChange !== 0 && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: overallChange > 0 ? '#22c55e' : '#ef4444',
                        fontSize: '14px',
                        fontWeight: '500',
                      }}>
                        <span>{overallChange > 0 ? '↑' : '↓'}</span>
                        <span>{overallChange > 0 ? '+' : ''}{overallChange} from last scan</span>
                      </div>
                    )}
                  </div>

              {/* Quick Stats */}
              <div style={{
                background: 'white',
                border: '1px solid #eee',
                borderRadius: '16px',
                padding: '28px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
              }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>Total Scans</div>
                  <div style={{ fontSize: '32px', fontWeight: '600' }}>{userData.totalScans}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>Current Streak</div>
                  <div style={{ fontSize: '32px', fontWeight: '600' }}>{userData.streak}<span style={{ fontSize: '16px', color: '#888' }}> days</span></div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>Issues Detected</div>
                  <div style={{ fontSize: '32px', fontWeight: '600' }}>{detectedIssues.length}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>Member Since</div>
                  <div style={{ fontSize: '18px', fontWeight: '500' }}>{userData.memberSince}</div>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div style={{
              background: 'white',
              border: '1px solid #eee',
              borderRadius: '16px',
              padding: '28px',
              marginBottom: '24px',
            }}>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '24px' }}>
                Breakdown
              </div>
              <div style={{ display: 'grid', gap: '20px' }}>
                {Object.entries(currentScore.breakdown).map(([key, data]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '120px', fontSize: '14px', color: '#666', textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div style={{ flex: 1, height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${data.score}%`,
                        height: '100%',
                        background: data.score >= 70 ? '#0a0a0a' : data.score >= 50 ? '#888' : '#ef4444',
                        borderRadius: '4px',
                        transition: 'width 0.5s ease-out',
                      }} />
                    </div>
                    <div style={{ width: '50px', fontSize: '15px', fontWeight: '600', textAlign: 'right' }}>
                      {data.score}
                    </div>
                    <div style={{
                      width: '60px',
                      fontSize: '13px',
                      color: getTrendColor(data.status),
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      {getTrendIcon(data.status)}
                      {data.change > 0 ? `+${data.change}` : data.change}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            </>
            )}

            {/* Quick Actions */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
            }}>
              <button
                onClick={() => setShowComingSoon('report')}
                style={{
                  padding: '20px',
                  background: 'white',
                  border: '1px solid #eee',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#fafafa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '500', marginBottom: '2px' }}>
                    View Full Report
                  </div>
                  <div style={{ fontSize: '13px', color: '#888' }}>
                    Download PDF
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowGoalsModal(true)}
                style={{
                  padding: '20px',
                  background: 'white',
                  border: '1px solid #eee',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#fafafa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="6"/>
                    <circle cx="12" cy="12" r="2"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '500', marginBottom: '2px' }}>
                    Set Goals
                  </div>
                  <div style={{ fontSize: '13px', color: '#888' }}>
                    Track targets
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowReminderModal(true)}
                style={{
                  padding: '20px',
                  background: 'white',
                  border: '1px solid #eee',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#fafafa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                    <path d="M9 16l2 2 4-4"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '500', marginBottom: '2px' }}>
                    Scan Reminder
                  </div>
                  <div style={{ fontSize: '13px', color: '#888' }}>
                    Set schedule
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowComingSoon('ai')}
                style={{
                  padding: '20px',
                  background: 'white',
                  border: '1px solid #eee',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#fafafa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="10" r="1"/>
                    <circle cx="8" cy="10" r="1"/>
                    <circle cx="16" cy="10" r="1"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '500', marginBottom: '2px' }}>
                    Get Advice
                  </div>
                  <div style={{ fontSize: '13px', color: '#888' }}>
                    Ask our AI
                  </div>
                </div>
              </button>
            </div>

            {/* Quick Navigation Cards */}
            {detectedIssues.length > 0 || recommendations.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginTop: '24px',
              }}>
                {detectedIssues.length > 0 && (
                  <button
                    onClick={() => setActiveTab('issues')}
                    style={{
                      padding: '20px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#dc2626' }}>
                      {detectedIssues.length}
                    </div>
                    <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px', color: '#0a0a0a' }}>
                      Issues Detected
                    </div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      View details →
                    </div>
                  </button>
                )}

                {recommendations.length > 0 && (
                  <button
                    onClick={() => setActiveTab('recommendations')}
                    style={{
                      padding: '20px',
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#16a34a' }}>
                      {recommendations.length}
                    </div>
                    <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px', color: '#0a0a0a' }}>
                      Recommendations
                    </div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      View actions →
                    </div>
                  </button>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* ISSUES TAB */}
        {activeTab === 'issues' && (
          <div style={{ animation: 'fade-in 0.3s ease-out' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                Detected Issues
              </h2>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Based on your latest scan from today
              </p>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              {detectedIssues.length === 0 ? (
                <div style={{
                  background: 'white',
                  border: '1px solid #eee',
                  borderRadius: '16px',
                  padding: '48px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                    No issues detected yet
                  </h3>
                  <p style={{ color: '#888', fontSize: '14px' }}>
                    Complete your first scan to see detailed skin analysis
                  </p>
                  <button
                    onClick={handleNewScan}
                    style={{
                      marginTop: '24px',
                      padding: '12px 24px',
                      background: '#0a0a0a',
                      border: 'none',
                      borderRadius: '100px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                  >
                    Start Your First Scan
                  </button>
                </div>
              ) : (
                detectedIssues.map((issue, idx) => {
                  const badge = getSeverityBadge(issue.severity);
                  return (
                    <div
                      key={idx}
                      style={{
                        background: 'white',
                        border: '1px solid #eee',
                        borderRadius: '16px',
                        padding: '24px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', textTransform: 'capitalize' }}>
                              {issue.issue_type.replace(/_/g, ' ')}
                            </h3>
                            <span style={{
                              padding: '4px 10px',
                              background: badge.bg,
                              color: badge.color,
                              fontSize: '12px',
                              fontWeight: '500',
                              borderRadius: '100px',
                            }}>
                              {badge.text}
                            </span>
                          </div>
                          <p style={{ color: '#666', fontSize: '14px' }}>
                            Location: {issue.location}
                          </p>
                        </div>
                      </div>

                    {/* Issue count if available */}
                    {issue.count && (
                      <div style={{
                        padding: '16px',
                        background: '#fafafa',
                        borderRadius: '12px',
                        marginTop: '12px',
                      }}>
                        <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Count</div>
                        <div style={{ fontSize: '24px', fontWeight: '600' }}>{issue.count}</div>
                      </div>
                    )}

                    <button
                      onClick={() => setExpandedIssue(expandedIssue === issue.issue_type ? null : issue.issue_type)}
                      style={{
                        marginTop: '16px',
                        padding: '12px 20px',
                        background: '#f5f5f5',
                        border: 'none',
                        borderRadius: '100px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {expandedIssue === issue.issue_type ? 'Show less' : 'View details'}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{
                          transform: expandedIssue === issue.issue_type ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s'
                        }}
                      >
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>

                    {/* Expanded details */}
                    {expandedIssue === issue.issue_type && issueDetailsDatabase[issue.issue_type] && (
                      <div style={{
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid #eee',
                      }}>
                        <h5 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>What is this?</h5>
                        <p style={{ fontSize: '13px', color: '#444', marginBottom: '12px', lineHeight: 1.5 }}>
                          {issueDetailsDatabase[issue.issue_type].what}
                        </p>

                        <h5 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Why it happens:</h5>
                        <p style={{ fontSize: '13px', color: '#444', marginBottom: '12px', lineHeight: 1.5 }}>
                          {issueDetailsDatabase[issue.issue_type].why}
                        </p>

                        <h5 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Tips to improve:</h5>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {issueDetailsDatabase[issue.issue_type].tips.map((tip, i) => (
                            <li key={i} style={{ fontSize: '13px', color: '#444', marginBottom: '6px', lineHeight: 1.5 }}>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })
              )}
            </div>

            {/* Face Map Visualization */}
            <div style={{
              background: 'white',
              border: '1px solid #eee',
              borderRadius: '16px',
              padding: '24px',
              marginTop: '24px',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
                Issue Map
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                background: '#fafafa',
                borderRadius: '12px',
              }}>
                {/* Simplified face diagram */}
                <div style={{ position: 'relative', width: '200px', height: '260px' }}>
                  {/* Face outline */}
                  <div style={{
                    width: '100%',
                    height: '100%',
                    border: '2px solid #ddd',
                    borderRadius: '50% 50% 45% 45%',
                    position: 'relative',
                  }}>
                    {/* T-zone indicator */}
                    <div style={{
                      position: 'absolute',
                      top: '15%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '60px',
                      height: '120px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '2px dashed #ef4444',
                      borderRadius: '8px',
                    }} />
                    {/* Nose area */}
                    <div style={{
                      position: 'absolute',
                      top: '45%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '30px',
                      height: '40px',
                      background: 'rgba(234, 179, 8, 0.2)',
                      border: '2px solid #eab308',
                      borderRadius: '6px',
                    }} />
                  </div>
                </div>
                <div style={{ marginLeft: '40px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ width: '16px', height: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '2px dashed #ef4444', borderRadius: '4px' }} />
                    <span style={{ fontSize: '13px', color: '#666' }}>Oily T-zone</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ width: '16px', height: '16px', background: 'rgba(234, 179, 8, 0.2)', border: '2px solid #eab308', borderRadius: '4px' }} />
                    <span style={{ fontSize: '13px', color: '#666' }}>Blackheads</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '16px', height: '16px', background: '#f0f0f0', border: '2px solid #ccc', borderRadius: '4px' }} />
                    <span style={{ fontSize: '13px', color: '#666' }}>Enlarged pores</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PROGRESS TAB */}
        {activeTab === 'progress' && (
          <div style={{ animation: 'fade-in 0.3s ease-out' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                Your Progress
              </h2>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Track how your skin has improved over time
              </p>
            </div>

            {/* Progress Chart */}
            <div style={{
              background: 'white',
              border: '1px solid #eee',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Skin Score Trend</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['1W', '1M', '3M', 'All'].map(period => (
                    <button
                      key={period}
                      style={{
                        padding: '6px 12px',
                        background: period === '1W' ? '#0a0a0a' : '#f5f5f5',
                        color: period === '1W' ? 'white' : '#666',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                      }}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simple bar chart */}
              {isLoadingExtras ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                  <p style={{ color: '#888', fontSize: '14px' }}>Loading scan history...</p>
                </div>
              ) : scanHistory.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                  <p style={{ color: '#888', fontSize: '14px', marginBottom: '8px' }}>No scan history yet</p>
                  <p style={{ color: '#aaa', fontSize: '13px' }}>Complete more scans to see your progress</p>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '200px', padding: '0 20px' }}>
                  {scanHistory.map((scan, i) => {
                    const isLatest = i === scanHistory.length - 1; // Last item is the latest (newest)
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: '100%',
                          height: `${scan.score * 2}px`,
                          background: isLatest ? '#0a0a0a' : '#e5e5e5',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.5s ease-out',
                          position: 'relative',
                        }}>
                          <span style={{
                            position: 'absolute',
                            top: '-24px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: isLatest ? '#0a0a0a' : '#888',
                          }}>
                            {scan.score}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>{scan.date}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Metric Comparison */}
            {scanHistory.length >= 2 && (
              <div style={{
                background: 'white',
                border: '1px solid #eee',
                borderRadius: '16px',
                padding: '24px',
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
                  First Scan vs Now
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
                  {(() => {
                    const firstScan = scanHistory[0];
                    const latestScan = scanHistory[scanHistory.length - 1];
                    const metrics = [
                      { label: 'Overall Score', first: firstScan.score, now: latestScan.score },
                      { label: 'Hydration', first: firstScan.hydration, now: latestScan.hydration },
                      { label: 'Oil Control', first: firstScan.oilControl, now: latestScan.oilControl },
                      { label: 'Pore Health', first: firstScan.poreHealth, now: latestScan.poreHealth },
                    ];
                    return metrics.map(metric => {
                      const improvement = metric.now - metric.first;
                      const isImproving = improvement > 0;
                      return (
                        <div key={metric.label} style={{
                          padding: '20px',
                          background: '#fafafa',
                          borderRadius: '12px',
                          textAlign: 'center',
                        }}>
                          <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>{metric.label}</div>
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px', color: '#ccc' }}>{metric.first}</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isImproving ? '#22c55e' : '#ef4444'} strokeWidth="2">
                              <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                            <span style={{ fontSize: '24px', fontWeight: '600' }}>{metric.now}</span>
                          </div>
                          <div style={{ fontSize: '13px', color: isImproving ? '#22c55e' : '#ef4444', marginTop: '8px', fontWeight: '500' }}>
                            {isImproving ? '+' : ''}{improvement} {isImproving ? 'improvement' : 'change'}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* RECOMMENDATIONS TAB */}
        {activeTab === 'recommendations' && (
          <div style={{ animation: 'fade-in 0.3s ease-out' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                Personalized Recommendations
              </h2>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Actions tailored to your skin's specific needs
              </p>
            </div>

            {isLoadingExtras ? (
              <div style={{
                background: 'white',
                border: '1px solid #eee',
                borderRadius: '16px',
                padding: '48px',
                textAlign: 'center',
              }}>
                <p style={{ color: '#888', fontSize: '14px' }}>Loading recommendations...</p>
              </div>
            ) : recommendations.length === 0 ? (
              <div style={{
                background: 'white',
                border: '1px solid #eee',
                borderRadius: '16px',
                padding: '48px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>💡</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  No recommendations yet
                </h3>
                <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>
                  Complete a scan to get personalized skincare recommendations
                </p>
                <button
                  onClick={handleNewScan}
                  style={{
                    padding: '12px 24px',
                    background: '#0a0a0a',
                    border: 'none',
                    borderRadius: '100px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  Start Your First Scan
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {recommendations.map(rec => (
                <div
                  key={rec.id}
                  style={{
                    background: 'white',
                    border: rec.priority === 'high' ? '2px solid #0a0a0a' : '1px solid #eee',
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    gap: '20px',
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: '#f5f5f5',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    flexShrink: 0,
                  }}>
                    {rec.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{rec.title}</h3>
                      {rec.priority === 'high' && (
                        <span style={{
                          padding: '2px 8px',
                          background: '#0a0a0a',
                          color: 'white',
                          fontSize: '10px',
                          fontWeight: '600',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                        }}>
                          Priority
                        </span>
                      )}
                    </div>
                    <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
                      {rec.description}
                    </p>
                    <button
                      onClick={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}
                      style={{
                        padding: '10px 20px',
                        background: rec.priority === 'high' ? '#0a0a0a' : '#f5f5f5',
                        color: rec.priority === 'high' ? 'white' : '#0a0a0a',
                        border: 'none',
                        borderRadius: '100px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {expandedRec === rec.id ? 'Show less' : 'Learn more'}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{
                          transform: expandedRec === rec.id ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s'
                        }}
                      >
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>

                    {/* Expanded content */}
                    {expandedRec === rec.id && (
                      <div style={{
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid #eee',
                        fontSize: '14px',
                        color: '#444',
                        lineHeight: 1.6,
                      }}>
                        <h5 style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>Why this helps:</h5>
                        <p style={{ marginBottom: '12px' }}>
                          {rec.ingredient
                            ? `Based on your scan results, ${rec.ingredient} can help address the concerns we detected in your skin. This ingredient has been clinically proven to improve skin health.`
                            : `Based on your scan results, this product type can help improve your specific skin concerns. Our AI analysis identified this as a priority for your routine.`
                          }
                        </p>

                        <h5 style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>How to use:</h5>
                        <p style={{ marginBottom: '12px' }}>
                          {rec.title.toLowerCase().includes('cleanser') && 'Apply to damp skin, massage gently for 30 seconds, then rinse thoroughly. Use twice daily.'}
                          {rec.title.toLowerCase().includes('serum') && 'Apply 2-3 drops to clean, dry skin before moisturizer. Use once or twice daily.'}
                          {rec.title.toLowerCase().includes('moisturizer') && 'Apply to clean skin morning and night. Massage gently until fully absorbed.'}
                          {rec.title.toLowerCase().includes('spf') && 'Apply as the final step of your morning routine. Reapply every 2 hours when in direct sunlight.'}
                          {!rec.title.toLowerCase().includes('cleanser') &&
                           !rec.title.toLowerCase().includes('serum') &&
                           !rec.title.toLowerCase().includes('moisturizer') &&
                           !rec.title.toLowerCase().includes('spf') &&
                           'Apply to clean skin as part of your daily routine. Follow product-specific instructions for best results.'}
                        </p>

                        {rec.ingredient && (
                          <>
                            <h5 style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>Key ingredient:</h5>
                            <div style={{
                              display: 'inline-block',
                              padding: '6px 12px',
                              background: '#f0f9ff',
                              borderRadius: '6px',
                              fontSize: '13px',
                              color: '#0369a1',
                            }}>
                              {rec.ingredient}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              </div>
            )}

            {/* Daily Routine */}
            {recommendations.length > 0 && (
            <div style={{
              background: 'white',
              border: '1px solid #eee',
              borderRadius: '16px',
              padding: '24px',
              marginTop: '24px',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
                Your Suggested Routine
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Morning */}
                <div>
                  <div style={{ fontSize: '13px', color: '#888', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ☀️ Morning
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {['Gentle cleanser', 'Niacinamide serum', 'Oil-free moisturizer', 'SPF 30+'].map((step, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}>
                          {i + 1}
                        </div>
                        <span style={{ fontSize: '14px' }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Evening */}
                <div>
                  <div style={{ fontSize: '13px', color: '#888', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    🌙 Evening
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {['Salicylic acid cleanser', 'Niacinamide serum', 'Retinol (2x/week)', 'Night moisturizer'].map((step, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}>
                          {i + 1}
                        </div>
                        <span style={{ fontSize: '14px' }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>
        )}
      </main>

      {/* Warning modal for last scan */}
      {showWarningModal && (
        <LowScansWarning
          scansRemaining={scansRemaining}
          onContinue={proceedToScan}
          onUpgrade={() => {
            setShowWarningModal(false);
            setShowUpgradeModal(true);
          }}
        />
      )}

      {/* Upgrade modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={() => {
          router.push('/pricing');
        }}
        scansUsed={scansUsed}
        scansLimit={limit}
      />

      {/* AI Chat Modal */}
      <AIChatModal
        isOpen={showAIChatModal}
        onClose={() => setShowAIChatModal(false)}
        scanContext={latestScan}
      />

      {/* Coming Soon Modal */}
      <ComingSoonModal
        isOpen={showComingSoon !== null}
        onClose={() => setShowComingSoon(null)}
        feature={showComingSoon || 'report'}
      />

      {/* Scan Reminder Settings Modal */}
      {showReminderModal && user && (
        <ScanReminderSettings
          userId={user.id}
          onClose={() => setShowReminderModal(false)}
        />
      )}

      {/* Skin Goals Settings Modal */}
      {showGoalsModal && user && (
        <SkinGoalsSettings
          userId={user.id}
          onClose={() => setShowGoalsModal(false)}
        />
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      `}} />
    </div>
  );
}
