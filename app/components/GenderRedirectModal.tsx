'use client';

import React from 'react';

interface GenderRedirectModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  reason: 'female_detected' | 'minor_detected';
}

export default function GenderRedirectModal({ isOpen, onClose, message, reason }: GenderRedirectModalProps) {
  if (!isOpen) return null;

  const content = {
    female_detected: {
      icon: '👋',
      title: 'Twacha Labs is for Men\'s Skincare',
      cta: 'Join Waitlist for All Skin Types',
    },
    minor_detected: {
      icon: '🔞',
      title: 'Age Restriction',
      cta: 'Got it',
    },
  };

  const c = content[reason];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '24px',
          maxWidth: '420px',
          width: '100%',
          padding: '40px 32px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '52px', marginBottom: '20px' }}>{c.icon}</div>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#0a0a0a' }}>
          {c.title}
        </h2>

        <p style={{ color: '#666', fontSize: '15px', marginBottom: '28px', lineHeight: 1.6 }}>
          {message}
        </p>

        {reason === 'female_detected' && (
          <div
            style={{
              background: '#fafafa',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px', fontWeight: '600' }}>
              WHY MEN'S SKINCARE IS DIFFERENT:
            </div>
            <div style={{ fontSize: '14px', color: '#444', lineHeight: 1.6 }}>
              • 25% thicker skin with more collagen<br />
              • Higher oil production and larger pores<br />
              • Different texture and aging patterns<br />
              • Unique needs from shaving and facial hair
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '16px',
            background: '#0a0a0a',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '12px',
          }}
        >
          {c.cta}
        </button>

        {reason === 'female_detected' && (
          <p style={{ fontSize: '13px', color: '#888', marginTop: '12px' }}>
            We respect all skin types and are building inclusive solutions
          </p>
        )}

        {reason === 'minor_detected' && (
          <p style={{ fontSize: '13px', color: '#888', marginTop: '12px' }}>
            Our service is designed for adults 16+ years old
          </p>
        )}
      </div>
    </div>
  );
}
