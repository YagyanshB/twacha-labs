'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade?: () => void
}

export default function UpgradeModal({ isOpen, onClose, onUpgrade }: UpgradeModalProps) {
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade()
    } else {
      router.push('/pricing')
    }
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={handleBackdropClick}
    >
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '420px',
        width: '100%',
        position: 'relative',
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#888',
            fontSize: '24px',
            lineHeight: 1,
          }}
          aria-label="Close modal"
        >
          ×
        </button>

        <div style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 24px',
          borderRadius: '16px',
          background: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>

        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          textAlign: 'center',
          marginBottom: '8px',
          color: '#0a0a0a',
          letterSpacing: '-0.02em',
        }}>
          Upgrade to Premium
        </h2>

        <p style={{
          fontSize: '15px',
          color: '#666',
          textAlign: 'center',
          marginBottom: '32px',
          lineHeight: 1.6,
        }}>
          Get unlimited scans and unlock your full skin potential.
        </p>

        {/* Features */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '32px',
        }}>
          {[
            'Unlimited skin scans',
            'Detailed issue tracking over time',
            'Personalized product recommendations',
            'Priority support',
          ].map((feature, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span style={{ fontSize: '14px', color: '#444' }}>{feature}</span>
            </div>
          ))}
        </div>

        {/* Price */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px',
        }}>
          <span style={{ fontSize: '36px', fontWeight: '700', color: '#0a0a0a' }}>£4.99</span>
          <span style={{ fontSize: '15px', color: '#888' }}>/month</span>
        </div>

        {/* Buttons */}
        <button
          onClick={handleUpgrade}
          style={{
            width: '100%',
            padding: '16px 32px',
            background: '#0a0a0a',
            border: 'none',
            borderRadius: '100px',
            color: 'white',
            fontSize: '15px',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '12px',
          }}
        >
          Upgrade now
        </button>

        <button
          onClick={onClose}
          style={{
            width: '100%',
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

        <p style={{
          fontSize: '12px',
          color: '#b0b0b0',
          textAlign: 'center',
          marginTop: '16px',
        }}>
          Cancel anytime. No questions asked.
        </p>
      </div>
    </div>
  )
}
