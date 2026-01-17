'use client'

import React from 'react'
import Link from 'next/link'

interface ScanButtonProps {
  scansUsed: number
  scansLimit: number
  isPremium: boolean
  onScan?: () => void
  onUpgrade?: () => void
}

export default function ScanButton({ 
  scansUsed, 
  scansLimit, 
  isPremium, 
  onScan,
  onUpgrade 
}: ScanButtonProps) {
  const scansRemaining = scansLimit - scansUsed
  const isLimitReached = scansRemaining <= 0 && !isPremium

  const handleClick = () => {
    if (isLimitReached && onUpgrade) {
      onUpgrade()
    } else if (onScan) {
      onScan()
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      {/* Usage indicator - only show for free users */}
      {!isPremium && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: scansRemaining <= 1 ? '#fef2f2' : '#f5f5f5',
          borderRadius: '8px',
        }}>
          <div style={{
            display: 'flex',
            gap: '3px',
          }}>
            {[...Array(scansLimit)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: i < scansUsed ? '#0a0a0a' : '#ddd',
                }}
              />
            ))}
          </div>
          <span style={{
            fontSize: '12px',
            color: scansRemaining <= 1 ? '#dc2626' : '#666',
            fontWeight: '500',
          }}>
            {scansRemaining} left
          </span>
        </div>
      )}

      {/* Scan button */}
      {isLimitReached ? (
        <button
          onClick={handleClick}
          style={{
            padding: '10px 20px',
            background: '#0a0a0a',
            border: 'none',
            borderRadius: '100px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          Upgrade
        </button>
      ) : onScan ? (
        <button
          onClick={handleClick}
          style={{
            padding: '10px 20px',
            background: '#0a0a0a',
            border: 'none',
            borderRadius: '100px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          New Scan
        </button>
      ) : (
        <Link
          href="/analysis"
          style={{
            padding: '10px 20px',
            background: '#0a0a0a',
            border: 'none',
            borderRadius: '100px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          New Scan
        </Link>
      )}
    </div>
  )
}
