'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ScanReminderSettingsProps {
  userId: string;
  onClose: () => void;
}

export default function ScanReminderSettings({ userId, onClose }: ScanReminderSettingsProps) {
  const [frequency, setFrequency] = useState('every_3_days');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const frequencies = [
    { value: 'daily', label: 'Every day', description: 'Best for tracking rapid changes' },
    { value: 'every_2_days', label: 'Every 2 days', description: 'Recommended for most users' },
    { value: 'every_3_days', label: 'Every 3 days', description: 'Good for maintenance' },
    { value: 'weekly', label: 'Once a week', description: 'Casual tracking' },
  ];

  useEffect(() => {
    // Load existing settings
    const loadSettings = async () => {
      const { data } = await supabase
        .from('scan_reminders')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (data) {
        setFrequency(data.frequency);
        setIsActive(data.is_active);
      }
    };
    loadSettings();
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    
    // Upsert reminder settings
    const { error } = await supabase
      .from('scan_reminders')
      .upsert({
        user_id: userId,
        frequency,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (!error) {
      onClose();
    }
    setSaving(false);
  };

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
        borderRadius: '20px',
        maxWidth: '440px',
        width: '100%',
        padding: '28px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Scan Reminder</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>
            ✕
          </button>
        </div>

        {/* Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          background: '#fafafa',
          borderRadius: '12px',
          marginBottom: '20px',
        }}>
          <div>
            <div style={{ fontWeight: '500', marginBottom: '2px' }}>Enable reminders</div>
            <div style={{ fontSize: '13px', color: '#888' }}>Get notified to scan</div>
          </div>
          <button
            onClick={() => setIsActive(!isActive)}
            style={{
              width: '48px',
              height: '28px',
              borderRadius: '14px',
              background: isActive ? '#0a0a0a' : '#e5e5e5',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s',
            }}
          >
            <div style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: 'white',
              position: 'absolute',
              top: '3px',
              left: isActive ? '23px' : '3px',
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>

        {/* Frequency Options */}
        <div style={{ marginBottom: '24px', opacity: isActive ? 1 : 0.5, pointerEvents: isActive ? 'auto' : 'none' }}>
          <div style={{ fontSize: '14px', color: '#888', marginBottom: '12px' }}>How often?</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {frequencies.map((freq) => (
              <button
                key={freq.value}
                onClick={() => setFrequency(freq.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: frequency === freq.value ? '#0a0a0a' : 'white',
                  color: frequency === freq.value ? 'white' : '#0a0a0a',
                  border: frequency === freq.value ? 'none' : '1px solid #e5e5e5',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <div>
                  <div style={{ fontWeight: '500', marginBottom: '2px' }}>{freq.label}</div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>{freq.description}</div>
                </div>
                {frequency === freq.value && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
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
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
