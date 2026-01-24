'use client';

import { useState } from 'react';

interface ConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function ConsentModal({ isOpen, onAccept, onDecline }: ConsentModalProps) {
  const [checked, setChecked] = useState(false);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        maxWidth: '500px',
        width: '100%',
        padding: '32px',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#f0fdf4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '28px',
          }}>
            🩺
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '8px' }}>
            Important Health Disclaimer
          </h2>
          <p style={{ color: '#888', fontSize: '14px' }}>
            Please read carefully before using Twacha Labs
          </p>
        </div>

        {/* Content */}
        <div style={{
          background: '#fafafa',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          fontSize: '14px',
          lineHeight: 1.7,
          color: '#444',
        }}>
          <p style={{ marginBottom: '16px' }}>
            <strong>Twacha Labs is NOT a medical device and does NOT provide medical diagnosis.</strong>
          </p>

          <p style={{ marginBottom: '16px' }}>
            Our skin analysis is for <strong>informational and educational purposes only</strong>.
            The scores, observations, and recommendations provided are based on image analysis
            algorithms and should not be considered medical advice, diagnosis, or treatment.
          </p>

          <p style={{ marginBottom: '16px' }}>
            <strong>What we do:</strong>
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
            <li>Provide general observations about skin appearance</li>
            <li>Track changes over time through regular scans</li>
            <li>Offer general skincare education and guidance</li>
            <li>Suggest common skincare ingredients that may help</li>
          </ul>

          <p style={{ marginBottom: '16px' }}>
            <strong>What we do NOT do:</strong>
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
            <li>Diagnose any skin condition or disease</li>
            <li>Replace consultation with a dermatologist</li>
            <li>Provide medical treatment recommendations</li>
            <li>Identify skin cancer, infections, or serious conditions</li>
          </ul>

          <p style={{
            padding: '12px',
            background: '#fef2f2',
            borderRadius: '8px',
            color: '#991b1b',
            fontWeight: '500',
          }}>
            ⚠️ If you have concerns about a skin condition, unusual symptoms, or any
            lesion/growth, please consult a qualified dermatologist or healthcare provider immediately.
          </p>
        </div>

        {/* Checkbox */}
        <label style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          marginBottom: '24px',
          cursor: 'pointer',
        }}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            style={{
              width: '20px',
              height: '20px',
              marginTop: '2px',
              accentColor: '#0a0a0a',
              cursor: 'pointer',
            }}
          />
          <span style={{ fontSize: '14px', color: '#444' }}>
            I understand that Twacha Labs provides educational content only and is not a
            substitute for professional medical advice, diagnosis, or treatment. I will
            consult a healthcare provider for any medical concerns.
          </span>
        </label>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onDecline}
            style={{
              flex: 1,
              padding: '14px',
              background: '#f5f5f5',
              color: '#666',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            disabled={!checked}
            style={{
              flex: 1,
              padding: '14px',
              background: checked ? '#0a0a0a' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: checked ? 'pointer' : 'not-allowed',
            }}
          >
            I Understand, Continue
          </button>
        </div>
      </div>
    </div>
  );
}
