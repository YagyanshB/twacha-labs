'use client';

interface MedicalDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MedicalDisclaimerModal({ isOpen, onClose }: MedicalDisclaimerModalProps) {
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
        maxWidth: '560px',
        width: '100%',
        maxHeight: '85vh',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 24px 0',
          position: 'sticky',
          top: 0,
          background: 'white',
          borderBottom: '1px solid #eee',
          paddingBottom: '16px',
          zIndex: 1,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600' }}>
              Medical Disclaimer & Liability Waiver
            </h2>
            <button
              onClick={onClose}
              style={{
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
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Important Notice Box */}
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px',
              color: '#dc2626',
              fontWeight: '600',
              fontSize: '15px',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              IMPORTANT: Read Before Using
            </div>
            <p style={{ fontSize: '14px', color: '#991b1b', lineHeight: 1.6, margin: 0 }}>
              Twacha Labs uses Artificial Intelligence to provide skincare recommendations 
              based on visual analysis. <strong>This is NOT a medical diagnosis.</strong>
            </p>
          </div>

          {/* Main Disclaimer Text */}
          <div style={{ fontSize: '14px', color: '#444', lineHeight: 1.7 }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#0a0a0a' }}>
              What Twacha Labs CAN Do:
            </h3>
            <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
              <li style={{ marginBottom: '8px' }}>Analyze visible skin characteristics (pores, texture, oiliness)</li>
              <li style={{ marginBottom: '8px' }}>Provide general skincare product recommendations</li>
              <li style={{ marginBottom: '8px' }}>Track changes in skin appearance over time</li>
              <li style={{ marginBottom: '8px' }}>Offer educational information about skincare ingredients</li>
            </ul>

            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#0a0a0a' }}>
              What Twacha Labs CANNOT Do:
            </h3>
            <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
              <li style={{ marginBottom: '8px' }}><strong>Diagnose skin cancer, melanoma, or any skin disease</strong></li>
              <li style={{ marginBottom: '8px' }}>Identify cysts, infections, or underlying medical conditions</li>
              <li style={{ marginBottom: '8px' }}>Replace professional medical advice or dermatologist consultation</li>
              <li style={{ marginBottom: '8px' }}>Prescribe medications or treatments</li>
            </ul>

            <div style={{
              background: '#f9fafb',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              borderLeft: '4px solid #0a0a0a',
            }}>
              <p style={{ margin: 0, fontWeight: '500' }}>
                ⚠️ If you notice a changing mole, painful cyst, unusual growth, or any 
                concerning skin changes, please see a qualified Dermatologist immediately.
              </p>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#0a0a0a' }}>
              Data Processing (UK GDPR):
            </h3>
            <p style={{ marginBottom: '20px' }}>
              By using Twacha Labs, you consent to the processing of your facial images 
              (biometric data) for the purpose of skin analysis. Your images are processed 
              securely and in accordance with our{' '}
              <a href="/privacy" target="_blank" style={{ color: '#0a0a0a', textDecoration: 'underline' }}>Privacy Policy</a>. 
              You can request deletion of your data at any time.
            </p>

            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#0a0a0a' }}>
              Limitation of Liability:
            </h3>
            <p style={{ marginBottom: '20px' }}>
              By using this service, you acknowledge that Twacha Labs is for 
              <strong> informational and cosmetic purposes only</strong>. You assume 
              full responsibility for your skincare choices and agree not to hold 
              Twacha Labs liable for any outcomes resulting from following AI-generated 
              recommendations.
            </p>

            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#0a0a0a' }}>
              Your Agreement:
            </h3>
            <p style={{ marginBottom: '12px' }}>
              By checking the consent box and using Twacha Labs, you confirm that you:
            </p>
            <ul style={{ marginLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>Understand that this is NOT a medical device</li>
              <li style={{ marginBottom: '8px' }}>Will consult a doctor for any medical concerns</li>
              <li style={{ marginBottom: '8px' }}>Consent to processing of your facial images</li>
              <li style={{ marginBottom: '8px' }}>Accept the Terms of Service and Privacy Policy</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px 24px',
          borderTop: '1px solid #eee',
          position: 'sticky',
          bottom: 0,
          background: 'white',
        }}>
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
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
