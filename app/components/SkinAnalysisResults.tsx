'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Issue {
  type: string;
  severity: 'mild' | 'moderate' | 'severe';
  area: string;
  count: number | null;
}

interface Metrics {
  hydration: number;
  oilControl: number;
  poreHealth: number;
  texture: number;
  clarity: number;
}

interface SkinAnalysisResultsProps {
  overallScore: number;
  skinType: string;
  issues: Issue[];
  metrics: Metrics;
  recommendations: string[];
  summary: string;
  onScanAgain?: () => void;
}

export default function SkinAnalysisResults({
  overallScore,
  skinType,
  issues,
  metrics,
  recommendations,
  summary,
  onScanAgain
}: SkinAnalysisResultsProps) {

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return '#10b981'; // green
      case 'moderate': return '#f59e0b'; // yellow
      case 'severe': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
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
            marginBottom: '24px',
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

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '24px',
            border: '1px solid #eee',
          }}
        >
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#0a0a0a',
          }}>
            Summary
          </h2>
          <p style={{
            fontSize: '15px',
            color: '#666',
            lineHeight: 1.7,
          }}>
            {summary}
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
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
            {Object.entries(metrics).map(([key, value], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
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
                  marginBottom: '12px',
                  textTransform: 'capitalize',
                }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
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
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                    style={{
                      height: '100%',
                      background: getScoreColor(value),
                      borderRadius: '4px',
                    }}
                  />
                </div>

                <div style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#0a0a0a',
                }}>
                  {value}<span style={{ fontSize: '14px', color: '#999' }}>/100</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Issues */}
        {issues && issues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
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
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
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
                      {issue.area}
                      {issue.count && ` • ${issue.count} detected`}
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
              ))}
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
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

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
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
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
}
