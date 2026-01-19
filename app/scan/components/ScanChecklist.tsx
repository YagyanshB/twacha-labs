'use client';

interface ChecklistItem {
  label: string;
  checked: boolean;
}

interface ScanChecklistProps {
  items: ChecklistItem[];
}

export function ScanChecklist({ items }: ScanChecklistProps) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #eee',
      borderRadius: '16px',
      padding: '20px',
      maxWidth: '400px',
      margin: '0 auto',
    }}>
      <p style={{
        fontSize: '11px',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '16px',
        fontWeight: '500',
      }}>
        Scan checklist
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: item.checked ? '#22c55e' : '#f5f5f5',
              transition: 'all 0.2s ease',
            }}>
              {item.checked && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span style={{
              fontSize: '14px',
              color: item.checked ? '#0a0a0a' : '#666',
              fontWeight: item.checked ? '500' : '400',
              transition: 'all 0.2s ease',
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
