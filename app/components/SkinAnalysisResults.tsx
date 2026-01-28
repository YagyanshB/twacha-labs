'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface SkinAnalysisResultsProps {
  overallScore: number;
  skinType: string;
  issues: any[];
  metrics: any;
  recommendations: string[];
  summary: string;
  onScanAgain?: () => void;
  // New quality-aware props
  imageQuality?: {
    score: number;
    status: 'pass' | 'limited' | 'fail';
    issues: string[];
    unusableZones?: Array<{ zone: string; reason: string }>;
  };
  analysisData?: {
    confidence?: string;
    metrics?: any;
    issues_detected?: any[];
  };
  upsell?: {
    show_pro_kit: boolean;
    reason?: string;
    message?: string;
  };
}

export default function SkinAnalysisResults({
  overallScore,
  skinType,
  issues,
  metrics,
  recommendations,
  summary,
  onScanAgain,
  imageQuality,
  analysisData,
  upsell,
}: SkinAnalysisResultsProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
  }, []);

  const qualityStatus = imageQuality?.status || 'pass';
  const qualityScore = imageQuality?.score || 100;
  const confidence = analysisData?.confidence || 'high';

  // Quality status banner config
  const getQualityBanner = () => {
    if (qualityStatus === 'fail') {
      return {
        bg: '#fef2f2',
        border: '#fecaca',
        icon: '❌',
        title: 'Image Quality Too Low',
        color: '#dc2626',
      };
    }
    if (qualityStatus === 'limited') {
      return {
        bg: '#fffbeb',
        border: '#fef3c7',
        icon: '⚠️',
        title: `Limited Analysis (${qualityScore}% confidence)`,
        color: '#d97706',
      };
    }
    return {
      bg: '#f0fdf4',
      border: '#bbf7d0',
      icon: '✓',
      title: 'Good Image Quality',
      color: '#16a34a',
    };
  };

  const banner = getQualityBanner();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return '#10b981';
      case 'moderate': return '#f59e0b';
      case 'severe': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafafa',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: '#0a0a0a',
      padding: '40px 24px',
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        {/* Quality Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: banner.bg,
            border: `1px solid ${banner.border}`,
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: imageQuality?.issues && imageQuality.issues.length > 0 ? '12px' : 0,
          }}>
            <span style={{ fontSize: '24px' }}>{banner.icon}</span>
            <div>
              <div style={{ fontWeight: '600', color: banner.color, fontSize: '16px' }}>
                {banner.title}
              </div>
              {qualityStatus !== 'pass' && imageQuality?.issues && (
                <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                  {imageQuality.issues.join(', ')}
                </div>
              )}
            </div>
          </div>

          {/* Retake button for failed images */}
          {qualityStatus === 'fail' && onScanAgain && (
            <button
              onClick={onScanAgain}
              style={{
                width: '100%',
                padding: '12px',
                background: banner.color,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '500',
                cursor: 'pointer',
                marginTop: '12px',
              }}
            >
              Retake Photo
            </button>
          )}
        </motion.div>

        {/* Only show analysis if not failed */}
        {qualityStatus !== 'fail' && (
          <>
            {/* Header & Overall Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{
                textAlign: 'center',
                marginBottom: '48px',
              }}
            >
              <p style={{
                fontSize: '13px',
                color: '#888',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>
                Analysis complete
              </p>

              <h1 style={{
                fontSize: '36px',
                fontWeight: '600',
                letterSpacing: '-0.02em',
                marginBottom: '16px',
                color: '#0a0a0a',
              }}>
                Your Skin Report
              </h1>

              {/* Overall Score */}
              <div style={{
                display: 'inline-block',
                padding: '32px 48px',
                background: 'white',
                borderRadius: '20px',
                border: '1px solid #eee',
                marginBottom: '12px',
              }}>
                <div style={{
                  fontSize: '72px',
                  fontWeight: '700',
                  color: getScoreColor(overallScore),
                  lineHeight: 1,
                  marginBottom: '8px',
                }}>
                  {overallScore}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#888',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Overall Score
                </div>
              </div>

              {/* Confidence Badge */}
              {confidence !== 'high' && (
                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    background: '#fffbeb',
                    borderRadius: '100px',
                    fontSize: '12px',
                    color: '#d97706',
                    marginBottom: '12px',
                  }}>
                    {confidence} confidence due to image quality
                  </span>
                </div>
              )}

              {/* Skin Type Badge */}
              <div>
                <span style={{
                  display: 'inline-block',
                  padding: '8px 20px',
                  background: '#f5f5f5',
                  borderRadius: '100px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#0a0a0a',
                }}>
                  {skinType.charAt(0).toUpperCase() + skinType.slice(1)} skin
                </span>
              </div>
            </motion.div>

            {/* Low Confidence Zones Warning */}
            {imageQuality?.unusableZones && imageQuality.unusableZones.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fef3c7',
                  borderRadius: '16px',
                  padding: '16px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '8px', fontSize: '14px' }}>
                  ⚠️ Areas I couldn't fully analyze:
                </div>
                {imageQuality.unusableZones.map((zone, i) => (
                  <div key={i} style={{ fontSize: '13px', color: '#92400e', marginBottom: '4px' }}>
                    • <strong style={{ textTransform: 'capitalize' }}>{zone.zone.replace('_', ' ')}</strong>: {zone.reason}
                  </div>
                ))}
              </motion.div>
            )}

            {/* Metrics Grid with Confidence */}
            {isAuthenticated ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{
                  marginBottom: '24px',
                }}
              >
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  color: '#0a0a0a',
                }}>
                  Detailed Metrics
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '16px',
                }}>
                  {Object.entries(metrics).map(([key, value]: [string, any], index) => {
                  const metricValue = typeof value === 'object' ? value.score : value;
                  const metricConfidence = typeof value === 'object' ? value.confidence : 'high';

                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                      style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        border: '1px solid #eee',
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                      }}>
                        <div style={{
                          fontSize: '13px',
                          color: '#888',
                          textTransform: 'capitalize',
                        }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        {metricConfidence !== 'high' && (
                          <span style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            background: metricConfidence === 'low' ? '#fef2f2' : '#fffbeb',
                            color: metricConfidence === 'low' ? '#dc2626' : '#d97706',
                            borderRadius: '4px',
                          }}>
                            {metricConfidence}
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: '#f0f0f0',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        marginBottom: '8px',
                      }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${metricValue}%` }}
                          transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                          style={{
                            height: '100%',
                            background: metricConfidence === 'low' ? '#fbbf24' : getScoreColor(metricValue),
                            borderRadius: '4px',
                          }}
                        />
                      </div>

                      <div style={{
                        fontSize: '24px',
                        fontWeight: '600',
                        color: '#0a0a0a',
                      }}>
                        {metricValue}<span style={{ fontSize: '14px', color: '#999' }}>/100</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
            ) : (
              /* Blurred metrics for non-authenticated users */
              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <div style={{
                  filter: 'blur(8px)',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}>
                  <h2 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    marginBottom: '16px',
                    color: '#0a0a0a',
                  }}>
                    Detailed Metrics
                  </h2>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '16px',
                  }}>
                    {Object.entries(metrics).map(([key, value]: [string, any], index) => {
                      const metricValue = typeof value === 'object' ? value.score : value;
                      return (
                        <div
                          key={key}
                          style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '20px',
                            border: '1px solid #eee',
                          }}
                        >
                          <div style={{
                            fontSize: '13px',
                            color: '#888',
                            textTransform: 'capitalize',
                            marginBottom: '12px',
                          }}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <div style={{
                            width: '100%',
                            height: '8px',
                            background: '#f0f0f0',
                            borderRadius: '4px',
                            marginBottom: '8px',
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${metricValue}%`,
                              background: getScoreColor(metricValue),
                              borderRadius: '4px',
                            }} />
                          </div>
                          <div style={{
                            fontSize: '24px',
                            fontWeight: '600',
                            color: '#0a0a0a',
                          }}>
                            {metricValue}<span style={{ fontSize: '14px', color: '#999' }}>/100</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Overlay with sign up prompt */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: '16px',
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="1.5">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#0a0a0a' }}>
                    Want to see the full breakdown?
                  </h3>
                  <p style={{ color: '#666', marginBottom: '20px', textAlign: 'center', maxWidth: '400px', fontSize: '15px' }}>
                    Sign up free to unlock detailed metrics and recommendations.
                  </p>
                  <button
                    onClick={() => router.push('/login')}
                    style={{
                      padding: '14px 32px',
                      background: '#0a0a0a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '100px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '15px',
                    }}
                  >
                    Create Free Account
                  </button>
                </div>
              </div>
            )}

            {/* Issues */}
            {issues && issues.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                style={{
                  marginBottom: '24px',
                }}
              >
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  color: '#0a0a0a',
                }}>
                  Detected Issues
                </h2>
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  border: '1px solid #eee',
                  overflow: 'hidden',
                }}>
                  {issues.map((issue, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '20px 24px',
                        borderBottom: index < issues.length - 1 ? '1px solid #f0f0f0' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '15px',
                            fontWeight: '500',
                            color: '#0a0a0a',
                            marginBottom: '4px',
                          }}>
                            {issue.type}
                          </div>
                          <div style={{
                            fontSize: '13px',
                            color: '#888',
                          }}>
                            {issue.area || issue.location}
                            {issue.count && ` • ${issue.count} detected`}
                            {issue.confidence && issue.confidence !== 'high' && (
                              <span style={{ color: '#d97706' }}> • {issue.confidence} confidence</span>
                            )}
                          </div>
                        </div>
                        <div
                          style={{
                            padding: '6px 16px',
                            borderRadius: '100px',
                            fontSize: '12px',
                            fontWeight: '500',
                            textTransform: 'capitalize',
                            background: `${getSeverityColor(issue.severity)}15`,
                            color: getSeverityColor(issue.severity),
                          }}
                        >
                          {issue.severity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Pro Kit Upsell */}
            {upsell?.show_pro_kit && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                style={{
                  background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
                  borderRadius: '20px',
                  padding: '24px',
                  marginBottom: '20px',
                  color: 'white',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="6"/>
                    <circle cx="12" cy="12" r="2"/>
                  </svg>
                  <span style={{ fontSize: '13px', color: '#22c55e', fontWeight: '500' }}>
                    UPGRADE YOUR SCANS
                  </span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  Get Clinical-Grade Accuracy
                </h3>

                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '16px', lineHeight: 1.6 }}>
                  {upsell.message || "Standard phone cameras miss 40% of early-stage skin issues. The Twacha Pro Kit gives you consistent lighting and 15x magnification for pore-level analysis."}
                </p>

                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                }}>
                  {['15x Macro Lens', 'Ring Light', '94% Accuracy'].map((feature, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => window.location.href = '/shop/pro-kit'}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'white',
                    color: '#0a0a0a',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  Get Pro Kit - £19.99
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </motion.div>
            )}

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              style={{
                background: '#f9fafb',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px',
              }}
            >
              <div style={{ fontWeight: '600', marginBottom: '8px', color: '#0a0a0a' }}>Summary</div>
              <div style={{ fontSize: '14px', color: '#444', lineHeight: 1.7 }}>
                {summary}
              </div>
            </motion.div>

            {/* Recommendations */}
            {recommendations && recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                style={{
                  marginBottom: '32px',
                }}
              >
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  color: '#0a0a0a',
                }}>
                  Personalized Recommendations
                </h2>
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '32px',
                  border: '1px solid #eee',
                }}>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                  }}>
                    {recommendations.map((rec, index) => (
                      <li
                        key={index}
                        style={{
                          display: 'flex',
                          gap: '12px',
                          marginBottom: index < recommendations.length - 1 ? '16px' : 0,
                        }}
                      >
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          background: '#10b98115',
                          color: '#10b981',
                          borderRadius: '50%',
                          fontSize: '12px',
                          fontWeight: '600',
                          flexShrink: 0,
                        }}>
                          {index + 1}
                        </span>
                        <span style={{
                          fontSize: '15px',
                          color: '#666',
                          lineHeight: 1.7,
                        }}>
                          {rec}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
              }}
            >
              {onScanAgain && (
                <button
                  onClick={onScanAgain}
                  style={{
                    padding: '14px 32px',
                    background: '#0a0a0a',
                    border: 'none',
                    borderRadius: '100px',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Scan again
                </button>
              )}

              <Link
                href="/dashboard"
                style={{
                  padding: '14px 32px',
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '100px',
                  color: '#0a0a0a',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: 'all 0.2s',
                }}
              >
                View dashboard
              </Link>
            </motion.div>
          </>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
}
