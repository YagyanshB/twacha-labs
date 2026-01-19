'use client';

export function AnalyzingOverlay() {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      borderRadius: '20px',
      gap: '20px',
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '4px solid rgba(255, 255, 255, 0.2)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{
        color: 'white',
        fontSize: '16px',
        fontWeight: '500',
      }}>
        Analyzing your skin...
      </p>
    </div>
  );
}
