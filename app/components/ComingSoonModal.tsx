'use client';

import React from 'react';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'report' | 'ai';
}

export default function ComingSoonModal({ isOpen, onClose, feature }: ComingSoonModalProps) {
  if (!isOpen) return null;

  const content = {
    report: {
      icon: '📄',
      title: 'PDF Reports Coming Soon',
      description: "We're building detailed dermatology reports you can download and share with your skincare professional.",
      features: [
        'Complete scan history',
        'Progress visualizations',
        'Personalized insights',
        'Shareable with doctors',
      ],
      eta: 'February 2026',
    },
    ai: {
      icon: '💬',
      title: 'AI Advisor Coming Soon',
      description: 'Our AI skincare advisor is being trained to give you personalized recommendations based on your scan results.',
      features: [
        'Ask skincare questions',
        'Get product recommendations',
        'Understand your results',
        'Routine suggestions',
      ],
      eta: 'February 2026',
    },
  };

  const c = content[feature];

  return (
    <div
      onClick={onClose}
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
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '24px',
          maxWidth: '400px',
          width: '100%',
          padding: '40px 32px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>{c.icon}</div>

        <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '12px' }}>
          {c.title}
        </h2>

        <p style={{ color: '#666', fontSize: '15px', marginBottom: '24px', lineHeight: 1.6 }}>
          {c.description}
        </p>

        <div
          style={{
            background: '#fafafa',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
            WHAT TO EXPECT:
          </div>
          {c.features.map((f, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                marginBottom: i < c.features.length - 1 ? '8px' : 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {f}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '14px',
            background: '#0a0a0a',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Got it
        </button>

        <p style={{ fontSize: '12px', color: '#888', marginTop: '12px' }}>
          Expected: {c.eta}
        </p>
      </div>
    </div>
  );
}
