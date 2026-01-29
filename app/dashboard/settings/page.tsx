'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useUser();

  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    skin_goals: [] as string[],
    primary_goal: '',
    is_premium: false,
    monthly_scans_used: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchProfile();
    }
  }, [user, authLoading, router]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile({
        full_name: data.full_name || '',
        email: data.email || user.email || '',
        skin_goals: data.skin_goals || [],
        primary_goal: data.primary_goal || '',
        is_premium: data.is_premium || false,
        monthly_scans_used: data.monthly_scans_used || 0,
      });
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        skin_goals: profile.skin_goals,
        primary_goal: profile.primary_goal,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      setMessage('Failed to save. Please try again.');
      console.error('Profile update error:', error);
    } else {
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
    setIsSaving(false);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (authLoading || isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fafafa',
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  const skinGoalOptions = [
    'Reduce acne',
    'Minimize pores',
    'Control oiliness',
    'Reduce blackheads',
    'Improve texture',
    'Anti-aging',
    'Hydration',
    'Even skin tone',
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafafa',
      fontFamily: 'Inter, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <header style={{
        padding: '16px 24px',
        borderBottom: '1px solid #eee',
        background: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h1 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Settings</h1>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            padding: '8px 16px',
            background: '#f5f5f5',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Back to Dashboard
        </button>
      </header>

      <main style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
        {/* Profile Section */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #eee',
          padding: '24px',
          marginBottom: '16px',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', marginTop: 0 }}>
            Profile Information
          </h2>

          {/* Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#666', marginBottom: '8px' }}>
              Full Name
            </label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="Enter your name"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e5e5e5',
                borderRadius: '12px',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Email (read-only) */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#666', marginBottom: '8px' }}>
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e5e5e5',
                borderRadius: '12px',
                fontSize: '15px',
                background: '#f9f9f9',
                color: '#888',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Skin Goals */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#666', marginBottom: '8px' }}>
              Skin Goals (select all that apply)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {skinGoalOptions.map((goal) => (
                <button
                  key={goal}
                  onClick={() => {
                    const goals = profile.skin_goals.includes(goal)
                      ? profile.skin_goals.filter(g => g !== goal)
                      : [...profile.skin_goals, goal];
                    setProfile({ ...profile, skin_goals: goals });
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '100px',
                    border: profile.skin_goals.includes(goal) ? '2px solid #0a0a0a' : '1px solid #e5e5e5',
                    background: profile.skin_goals.includes(goal) ? '#0a0a0a' : '#fff',
                    color: profile.skin_goals.includes(goal) ? '#fff' : '#444',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Goal */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#666', marginBottom: '8px' }}>
              Primary Goal
            </label>
            <select
              value={profile.primary_goal}
              onChange={(e) => setProfile({ ...profile, primary_goal: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e5e5e5',
                borderRadius: '12px',
                fontSize: '15px',
                outline: 'none',
                background: '#fff',
                boxSizing: 'border-box',
              }}
            >
              <option value="">Select your primary goal</option>
              {skinGoalOptions.map((goal) => (
                <option key={goal} value={goal}>{goal}</option>
              ))}
            </select>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              width: '100%',
              padding: '14px',
              background: '#0a0a0a',
              color: '#fff',
              border: 'none',
              borderRadius: '100px',
              fontSize: '15px',
              fontWeight: 500,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>

          {message && (
            <p style={{
              textAlign: 'center',
              marginTop: '12px',
              marginBottom: 0,
              fontSize: '14px',
              color: message.includes('Failed') ? '#ef4444' : '#22c55e',
            }}>
              {message}
            </p>
          )}
        </div>

        {/* Account Section */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #eee',
          padding: '24px',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', marginTop: 0 }}>
            Account
          </h2>

          {/* Subscription Status */}
          <div style={{
            padding: '20px',
            background: '#fafafa',
            borderRadius: '12px',
            marginBottom: '16px',
          }}>
            <h4 style={{ fontWeight: '600', marginBottom: '4px', marginTop: 0, fontSize: '15px' }}>
              {profile.is_premium ? 'Premium Plan' : 'Free Plan'}
            </h4>
            <p style={{ color: '#666', fontSize: '14px', margin: 0, marginBottom: profile.is_premium ? 0 : '12px' }}>
              {profile.is_premium
                ? 'Unlimited scans per month'
                : `${Math.max(0, 5 - profile.monthly_scans_used)} of 5 scans remaining this month`
              }
            </p>

            {!profile.is_premium && (
              <button
                onClick={() => router.push('/pricing')}
                style={{
                  marginTop: '12px',
                  padding: '10px 20px',
                  background: '#0a0a0a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Upgrade to Premium
              </button>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '14px',
              background: '#fff',
              color: '#ef4444',
              border: '1px solid #ef4444',
              borderRadius: '100px',
              fontSize: '15px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Log Out
          </button>
        </div>
      </main>
    </div>
  );
}
