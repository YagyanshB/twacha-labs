'use client'

import React from 'react'

interface LowScansWarningProps {
  scansRemaining: number
  onContinue: () => void
  onUpgrade: () => void
}

export default function LowScansWarning({ 
  scansRemaining, 
  onContinue, 
  onUpgrade 
}: LowScansWarningProps) {
  if (scansRemaining > 1) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          margin: '0 auto 20px',
          borderRadius: '50%',
          background: '#fef3c7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: '24px' }}>⚡</span>
        </div>

        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '8px',
          color: '#0a0a0a',
          letterSpacing: '-0.01em',
        }}>
          {scansRemaining === 1 ? 'Last free scan!' : 'You\'re out of free scans'}
        </h2>

        <p style={{
          fontSize: '14px',
          color: '#666',
          marginBottom: '24px',
          lineHeight: 1.6,
        }}>
          {scansRemaining === 1
            ? 'This is your last free scan this month. Upgrade for unlimited scans and detailed tracking.'
            : 'Upgrade to Premium for unlimited scans, detailed recommendations, and progress tracking.'
          }
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {scansRemaining === 1 && (
            <button
              onClick={onContinue}
              style={{
                padding: '14px 24px',
                background: '#0a0a0a',
                border: 'none',
                borderRadius: '100px',
                color: 'white',
                fontSize: '15px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Use my last scan
            </button>
          )}

          <button
            onClick={onUpgrade}
            style={{
              padding: '14px 24px',
              background: scansRemaining === 0 ? '#0a0a0a' : '#f5f5f5',
              border: 'none',
              borderRadius: '100px',
              color: scansRemaining === 0 ? 'white' : '#0a0a0a',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Upgrade to Premium - £4.99/mo
          </button>

          {scansRemaining === 0 && (
            <button
              onClick={onContinue}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: 'none',
                color: '#888',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Maybe later
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
