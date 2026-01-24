'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface SkinGoalsSettingsProps {
  userId: string;
  onClose: () => void;
}

export default function SkinGoalsSettings({ userId, onClose }: SkinGoalsSettingsProps) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [saving, setSaving] = useState(false);

  const goals = [
    { id: 'reduce_acne', label: 'Reduce acne', icon: '○' },
    { id: 'minimize_pores', label: 'Minimize pores', icon: '◎' },
    { id: 'control_oil', label: 'Control oiliness', icon: '◐' },
    { id: 'reduce_blackheads', label: 'Reduce blackheads', icon: '●' },
    { id: 'improve_texture', label: 'Improve texture', icon: '▤' },
    { id: 'anti_aging', label: 'Anti-aging', icon: '↺' },
    { id: 'hydration', label: 'Better hydration', icon: '◇' },
    { id: 'even_tone', label: 'Even skin tone', icon: '◧' },
  ];

  useEffect(() => {
    const loadGoals = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('skin_goals, primary_goal')
        .eq('id', userId)
        .single();
      
      if (data) {
        setSelectedGoals(data.skin_goals || []);
        setPrimaryGoal(data.primary_goal || '');
      }
    };
    loadGoals();
  }, [userId]);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    
    await supabase
      .from('profiles')
      .update({
        skin_goals: selectedGoals,
        primary_goal: primaryGoal,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    setSaving(false);
    onClose();
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
        maxWidth: '480px',
        width: '100%',
        padding: '28px',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Your Skin Goals</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>
            ✕
          </button>
        </div>

        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
          Select all that apply. We'll personalize your recommendations.
        </p>

        {/* Goals Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
          {goals.map((goal) => (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              style={{
                padding: '14px',
                background: selectedGoals.includes(goal.id) ? '#0a0a0a' : 'white',
                color: selectedGoals.includes(goal.id) ? 'white' : '#0a0a0a',
                border: selectedGoals.includes(goal.id) ? 'none' : '1px solid #e5e5e5',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: '16px', opacity: 0.7 }}>{goal.icon}</span>
              {goal.label}
            </button>
          ))}
        </div>

        {/* Primary Goal */}
        {selectedGoals.length > 1 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>
              What's your #1 priority?
            </div>
            <select
              value={primaryGoal}
              onChange={(e) => setPrimaryGoal(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #e5e5e5',
                borderRadius: '12px',
                fontSize: '15px',
                background: 'white',
                cursor: 'pointer',
              }}
            >
              <option value="">Select primary goal</option>
              {selectedGoals.map(goalId => {
                const goal = goals.find(g => g.id === goalId);
                return goal ? (
                  <option key={goal.id} value={goal.id}>{goal.label}</option>
                ) : null;
              })}
            </select>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || selectedGoals.length === 0}
          style={{
            width: '100%',
            padding: '14px',
            background: selectedGoals.length === 0 ? '#e5e5e5' : '#0a0a0a',
            color: selectedGoals.length === 0 ? '#888' : 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '500',
            cursor: selectedGoals.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving...' : 'Save Goals'}
        </button>
      </div>
    </div>
  );
}
