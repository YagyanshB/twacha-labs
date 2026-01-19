'use client';

interface CountdownOverlayProps {
  countdown: number;
}

export function CountdownOverlay({ countdown }: CountdownOverlayProps) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      borderRadius: '20px',
    }}>
      <div style={{
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '64px',
        fontWeight: '700',
        color: '#0a0a0a',
        animation: 'pulse 0.5s ease-in-out',
      }}>
        {countdown}
      </div>
    </div>
  );
}
