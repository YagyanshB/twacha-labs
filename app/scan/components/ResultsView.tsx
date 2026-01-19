'use client';

import { useRouter } from 'next/navigation';

interface Issue {
  type: string;
  severity: 'mild' | 'moderate' | 'severe';
  area: string;
  count?: number | null;
}

interface Metrics {
  hydration: number;
  oilControl: number;
  poreHealth: number;
  texture: number;
  clarity: number;
}

interface AnalysisResult {
  overallScore: number;
  skinType: string;
  issues: Issue[];
  metrics: Metrics;
  recommendations: string[];
  summary: string;
}

interface ResultsViewProps {
  result: AnalysisResult;
  imageUrl: string;
  onNewScan: () => void;
}

const severityColors = {
  mild: '#facc15',
  moderate: '#f97316',
  severe: '#ef4444',
};

export function ResultsView({ result, imageUrl, onNewScan }: ResultsViewProps) {
  const router = useRouter();

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '24px',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#0a0a0a',
          marginBottom: '8px',
          letterSpacing: '-0.02em',
        }}>
          Your Skin Analysis
        </h1>
        <p style={{ color: '#666', fontSize: '15px' }}>
          {result.summary}
        </p>
      </div>

      {/* Overall Score Card */}
      <div style={{
        background: 'white',
        border: '1px solid #eee',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '14px',
          color: '#666',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '12px',
        }}>
          Overall Skin Score
        </p>
        <div style={{
          fontSize: '72px',
          fontWeight: '700',
          color: '#0a0a0a',
          marginBottom: '8px',
        }}>
          {result.overallScore}
        </div>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Skin Type: <strong>{result.skinType}</strong>
        </p>
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {Object.entries(result.metrics).map(([key, value]) => (
          <div key={key} style={{
            background: 'white',
            border: '1px solid #eee',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <p style={{
              fontSize: '12px',
              color: '#666',
              textTransform: 'capitalize',
              marginBottom: '8px',
            }}>
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </p>
            <div style={{
              fontSize: '32px',
              fontWeight: '600',
              color: '#0a0a0a',
            }}>
              {value}
            </div>
            <div style={{
              width: '100%',
              height: '4px',
              background: '#f5f5f5',
              borderRadius: '2px',
              marginTop: '8px',
            }}>
              <div style={{
                width: `${value}%`,
                height: '100%',
                background: '#0a0a0a',
                borderRadius: '2px',
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Detected Issues */}
      {result.issues.length > 0 && (
        <div style={{
          background: 'white',
          border: '1px solid #eee',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#0a0a0a',
            marginBottom: '16px',
          }}>
            Detected Issues
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {result.issues.map((issue, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                background: '#fafafa',
                borderRadius: '8px',
              }}>
                <div>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#0a0a0a',
                    marginBottom: '4px',
                  }}>
                    {issue.type}
                  </p>
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    {issue.area}
                    {issue.count && ` • ${issue.count} detected`}
                  </p>
                </div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '100px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: severityColors[issue.severity] + '20',
                  color: severityColors[issue.severity],
                }}>
                  {issue.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div style={{
        background: 'white',
        border: '1px solid #eee',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#0a0a0a',
          marginBottom: '16px',
        }}>
          Recommendations
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {result.recommendations.map((rec, i) => (
            <li key={i} style={{
              display: 'flex',
              alignItems: 'start',
              gap: '12px',
              marginBottom: '12px',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2" style={{ marginTop: '2px', flexShrink: 0 }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span style={{ fontSize: '14px', color: '#444', lineHeight: '1.6' }}>
                {rec}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
      }}>
        <button
          onClick={onNewScan}
          style={{
            padding: '14px 28px',
            background: '#0a0a0a',
            border: 'none',
            borderRadius: '100px',
            color: 'white',
            fontSize: '15px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          New Scan
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            padding: '14px 28px',
            background: 'white',
            border: '1px solid #eee',
            borderRadius: '100px',
            color: '#0a0a0a',
            fontSize: '15px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          View Dashboard
        </button>
      </div>
    </div>
  );
}
