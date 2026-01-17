'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { useScanAllowance } from '@/hooks/useScanAllowance';
import ScanButton from '@/app/components/ScanButton';
import LowScansWarning from '@/app/components/LowScansWarning';
import UpgradeModal from '@/app/components/UpgradeModal';

// Twacha Labs - Men's Skin Health Dashboard
// Designed for the first 200 beta users
// Features: Overall skin score, issue detection, progress tracking, actionable insights

export default function TwachaDashboard() {
  const { user, loading, signOut } = useUser();
  const router = useRouter();
  const { scansUsed, scansRemaining, isPremium, canScan, limit, refresh } = useScanAllowance();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedScan, setSelectedScan] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600 font-light">Loading...</div>
      </div>
    );
  }

  // Mock user data - replace with real data from API
  const userData = {
    name: user.email?.split('@')[0] || 'User',
    memberSince: new Date(user.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    totalScans: 8,
    streak: 12, // days
  };

  // Current skin score and metrics
  const currentScore = {
    overall: 72,
    previousOverall: 68,
    breakdown: {
      hydration: { score: 68, status: 'improving', change: +5 },
      oilControl: { score: 74, status: 'stable', change: 0 },
      poreHealth: { score: 65, status: 'needs-attention', change: -2 },
      texture: { score: 78, status: 'improving', change: +3 },
      clarity: { score: 75, status: 'stable', change: +1 },
    }
  };

  // Detected issues from latest scan
  const detectedIssues = [
    {
      id: 1,
      type: 'blackheads',
      severity: 'moderate',
      location: 'T-zone (nose, forehead)',
      count: 12,
      trend: 'decreasing',
      previousCount: 15,
    },
    {
      id: 2,
      type: 'enlarged-pores',
      severity: 'mild',
      location: 'Nose, cheeks',
      count: null,
      trend: 'stable',
      affectedArea: '15%',
    },
    {
      id: 3,
      type: 'oily-zones',
      severity: 'moderate',
      location: 'T-zone',
      trend: 'improving',
      sebumLevel: 'high',
    },
  ];

  // Scan history for progress tracking
  const scanHistory = [
    { date: 'Jan 15', score: 72, hydration: 68, oilControl: 74, poreHealth: 65 },
    { date: 'Jan 12', score: 70, hydration: 65, oilControl: 73, poreHealth: 66 },
    { date: 'Jan 8', score: 68, hydration: 63, oilControl: 74, poreHealth: 67 },
    { date: 'Jan 4', score: 66, hydration: 60, oilControl: 72, poreHealth: 65 },
    { date: 'Jan 1', score: 65, hydration: 58, oilControl: 70, poreHealth: 64 },
    { date: 'Dec 28', score: 63, hydration: 55, oilControl: 68, poreHealth: 62 },
  ];

  // Personalized recommendations
  const recommendations = [
    {
      id: 1,
      priority: 'high',
      title: 'Target your blackheads',
      description: 'Use a salicylic acid cleanser on your T-zone. This BHA penetrates pores to dissolve oil and dead skin buildup.',
      action: 'Add to routine',
      icon: '🎯',
    },
    {
      id: 2,
      priority: 'medium',
      title: 'Boost hydration',
      description: 'Your hydration is improving but still below optimal. Try a lightweight, oil-free moisturizer with hyaluronic acid.',
      action: 'Learn more',
      icon: '💧',
    },
    {
      id: 3,
      priority: 'medium',
      title: 'Minimize pores',
      description: 'Niacinamide can help reduce the appearance of enlarged pores. Look for 5% concentration in serums.',
      action: 'See products',
      icon: '🔬',
    },
  ];

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
          
          <div 
            onClick={signOut}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#f0f0f0',
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
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#22c55e',
                  fontSize: '14px',
                  fontWeight: '500',
                }}>
                  <span>↑</span>
                  <span>+{currentScore.overall - currentScore.previousOverall} from last scan</span>
                </div>
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

            {/* Quick Actions */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
            }}>
              <button style={{
                padding: '20px',
                background: 'white',
                border: '1px solid #eee',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>View Full Report</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Download PDF</div>
              </button>
              <button style={{
                padding: '20px',
                background: 'white',
                border: '1px solid #eee',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎯</div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>Set Goals</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Track targets</div>
              </button>
              <button style={{
                padding: '20px',
                background: 'white',
                border: '1px solid #eee',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📅</div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>Scan Reminder</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Every 3 days</div>
              </button>
              <button style={{
                padding: '20px',
                background: 'white',
                border: '1px solid #eee',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>💬</div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>Get Advice</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Ask our AI</div>
              </button>
            </div>
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
              {detectedIssues.map(issue => {
                const badge = getSeverityBadge(issue.severity);
                return (
                  <div
                    key={issue.id}
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
                            {issue.type.replace('-', ' ')}
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
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: getTrendColor(issue.trend === 'decreasing' ? 'improving' : issue.trend === 'increasing' ? 'needs-attention' : 'stable'),
                        fontSize: '13px',
                        fontWeight: '500',
                      }}>
                        {getTrendIcon(issue.trend === 'decreasing' ? 'improving' : issue.trend === 'increasing' ? 'needs-attention' : 'stable')}
                        {issue.trend}
                      </div>
                    </div>

                    {/* Issue-specific details */}
                    {issue.type === 'blackheads' && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '16px',
                        padding: '16px',
                        background: '#fafafa',
                        borderRadius: '12px',
                      }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Count</div>
                          <div style={{ fontSize: '24px', fontWeight: '600' }}>{issue.count}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Previous</div>
                          <div style={{ fontSize: '24px', fontWeight: '600', color: '#888' }}>{issue.previousCount}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Change</div>
                          <div style={{ fontSize: '24px', fontWeight: '600', color: '#22c55e' }}>
                            -{issue.previousCount! - issue.count!}
                          </div>
                        </div>
                      </div>
                    )}

                    {issue.type === 'enlarged-pores' && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '16px',
                        padding: '16px',
                        background: '#fafafa',
                        borderRadius: '12px',
                      }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Affected Area</div>
                          <div style={{ fontSize: '24px', fontWeight: '600' }}>{issue.affectedArea}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Status</div>
                          <div style={{ fontSize: '18px', fontWeight: '500', textTransform: 'capitalize' }}>{issue.trend}</div>
                        </div>
                      </div>
                    )}

                    {issue.type === 'oily-zones' && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '16px',
                        padding: '16px',
                        background: '#fafafa',
                        borderRadius: '12px',
                      }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Sebum Level</div>
                          <div style={{ fontSize: '18px', fontWeight: '500', textTransform: 'capitalize' }}>{issue.sebumLevel}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Trend</div>
                          <div style={{ fontSize: '18px', fontWeight: '500', textTransform: 'capitalize', color: '#22c55e' }}>{issue.trend}</div>
                        </div>
                      </div>
                    )}

                    <button style={{
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
                    }}>
                      View treatment options
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                );
              })}
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
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '200px', padding: '0 20px' }}>
                {scanHistory.slice().reverse().map((scan, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '100%',
                      height: `${scan.score * 2}px`,
                      background: i === scanHistory.length - 1 ? '#0a0a0a' : '#e5e5e5',
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
                        color: i === scanHistory.length - 1 ? '#0a0a0a' : '#888',
                      }}>
                        {scan.score}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>{scan.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metric Comparison */}
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
                {[
                  { label: 'Overall Score', first: 63, now: 72 },
                  { label: 'Hydration', first: 55, now: 68 },
                  { label: 'Oil Control', first: 68, now: 74 },
                  { label: 'Pore Health', first: 62, now: 65 },
                ].map(metric => (
                  <div key={metric.label} style={{
                    padding: '20px',
                    background: '#fafafa',
                    borderRadius: '12px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>{metric.label}</div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px', color: '#ccc' }}>{metric.first}</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                      <span style={{ fontSize: '24px', fontWeight: '600' }}>{metric.now}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#22c55e', marginTop: '8px', fontWeight: '500' }}>
                      +{metric.now - metric.first} improvement
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                    <button style={{
                      padding: '10px 20px',
                      background: rec.priority === 'high' ? '#0a0a0a' : '#f5f5f5',
                      color: rec.priority === 'high' ? 'white' : '#0a0a0a',
                      border: 'none',
                      borderRadius: '100px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}>
                      {rec.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Daily Routine */}
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
      />

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      `}} />
    </div>
  );
}
