'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function OnboardingPage() {
  const [name, setName] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const skinGoals = [
    'Reduce acne',
    'Minimize pores',
    'Control oiliness',
    'Reduce blackheads',
    'Improve texture',
    'Anti-aging',
    'Hydration',
    'Even skin tone',
  ];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Pre-fill name from Google if available
      if (user.user_metadata?.full_name) {
        setName(user.user_metadata.full_name);
      }
    };
    getUser();
  }, [router]);

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev =>
      prev.includes(goal)
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const handleComplete = async () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: name,
          skin_goals: selectedGoals,
          primary_goal: primaryGoal || selectedGoals[0] || null,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;

      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafafa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '48px 40px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', marginTop: 0 }}>
            Welcome to Twacha Labs
          </h1>
          <p style={{ color: '#666', fontSize: '15px', marginTop: 0 }}>
            Let's personalize your experience
          </p>
        </div>

        {/* Name Input */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            What should we call you?
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '1px solid #e5e5e5',
              borderRadius: '12px',
              fontSize: '16px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Skin Goals */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '12px'
          }}>
            What are your skin goals? (Select all that apply)
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {skinGoals.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => toggleGoal(goal)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '100px',
                  border: selectedGoals.includes(goal) ? '2px solid #0a0a0a' : '1px solid #e5e5e5',
                  background: selectedGoals.includes(goal) ? '#0a0a0a' : 'white',
                  color: selectedGoals.includes(goal) ? 'white' : '#444',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Goal (if multiple selected) */}
        {selectedGoals.length > 1 && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              Which is your primary goal?
            </label>
            <select
              value={primaryGoal}
              onChange={(e) => setPrimaryGoal(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #e5e5e5',
                borderRadius: '12px',
                fontSize: '16px',
                background: 'white',
                boxSizing: 'border-box',
              }}
            >
              <option value="">Select primary goal</option>
              {selectedGoals.map((goal) => (
                <option key={goal} value={goal}>{goal}</option>
              ))}
            </select>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={handleComplete}
          disabled={isLoading || !name.trim()}
          style={{
            width: '100%',
            padding: '16px',
            background: name.trim() ? '#0a0a0a' : '#e5e5e5',
            color: name.trim() ? 'white' : '#888',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: name.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          {isLoading ? 'Saving...' : 'Continue to Dashboard'}
        </button>

        {/* Skip option */}
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            width: '100%',
            padding: '12px',
            background: 'transparent',
            color: '#888',
            border: 'none',
            fontSize: '14px',
            cursor: 'pointer',
            marginTop: '12px',
          }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
