'use client';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  scanContext?: any;
}

export default function AIChatModal({ isOpen, onClose }: AIChatModalProps) {
  if (!isOpen) return null;

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
        borderRadius: '24px',
        width: '100%',
        maxWidth: '400px',
        padding: '40px 32px',
        textAlign: 'center',
        position: 'relative',
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: 'none',
            background: '#f5f5f5',
            cursor: 'pointer',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
          }}
        >
          ✕
        </button>

        {/* Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f0f0f0 0%, #e5e5e5 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="10" r="1" fill="#0a0a0a"/>
            <circle cx="8" cy="10" r="1" fill="#0a0a0a"/>
            <circle cx="16" cy="10" r="1" fill="#0a0a0a"/>
          </svg>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>
          AI Advisor Coming Soon
        </h2>

        <p style={{ color: '#666', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
          Our AI skincare advisor is being fine-tuned to give you personalized recommendations based on your scan results.
        </p>

        <div style={{
          background: '#f9f9f9',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          textAlign: 'left',
        }}>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>
            What you'll be able to ask:
          </div>
          <div style={{ fontSize: '14px', color: '#444', lineHeight: 1.6 }}>
            "What products help with blackheads?"<br/>
            "How can I reduce oily skin?"<br/>
            "What's a good routine for my skin type?"
          </div>
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

        <p style={{ fontSize: '12px', color: '#888', marginTop: '16px' }}>
          Expected: February 2026
        </p>
      </div>
    </div>
  );
}
