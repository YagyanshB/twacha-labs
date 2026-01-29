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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [earlyBirdAvailable, setEarlyBirdAvailable] = useState(false);
  const [earlyBirdSpots, setEarlyBirdSpots] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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

    // Check early bird availability
    const { count } = await supabase
      .from('early_bird_signups')
      .select('*', { count: 'exact', head: true });

    const EARLY_BIRD_LIMIT = 100;
    const spotsTaken = count || 0;
    setEarlyBirdSpots(EARLY_BIRD_LIMIT - spotsTaken);
    setEarlyBirdAvailable(spotsTaken < EARLY_BIRD_LIMIT);

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
      setIsSaving(false);
    } else {
      setMessage('Profile updated successfully! Refreshing...');
      // Force refresh to update dashboard with new name
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const handleSelectPlan = (plan: 'earlyBird' | 'monthly' | 'annual') => {
    const STRIPE_LINKS = {
      earlyBird: 'https://buy.stripe.com/3cI28r2W37WX0C5ghE24004',
      monthly: 'https://buy.stripe.com/7sYeVd8gndhhckNghE24001',
      annual: 'https://buy.stripe.com/4gM9ATbsz0uvacFc1o24003',
    };
    window.location.href = STRIPE_LINKS[plan];
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;

    setIsDeleting(true);

    try {
      if (!user) return;

      // Delete user data from all tables
      // Note: scan_issues and recommendations are linked to scans, so they'll be deleted when scans are deleted
      await supabase.from('scan_issues').delete().match({ scan_id: supabase.from('scans').select('id').eq('user_id', user.id) });
      await supabase.from('recommendations').delete().match({ scan_id: supabase.from('scans').select('id').eq('user_id', user.id) });
      await supabase.from('scans').delete().eq('user_id', user.id);
      await supabase.from('scan_reminders').delete().eq('user_id', user.id);
      await supabase.from('subscriptions').delete().eq('user_id', user.id);
      await supabase.from('profiles').delete().eq('id', user.id);

      // Sign out
      await signOut();

      // Redirect to home
      window.location.href = '/?deleted=true';
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please contact support.');
    } finally {
      setIsDeleting(false);
    }
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
              readOnly
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e5e5e5',
                borderRadius: '12px',
                fontSize: '15px',
                background: '#f5f5f5',
                color: '#888',
                cursor: 'not-allowed',
                boxSizing: 'border-box',
              }}
            />
            <p style={{ fontSize: '12px', color: '#888', marginTop: '6px', marginBottom: 0 }}>
              Email cannot be changed. Contact support if you need to update it.
            </p>
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
            border: '1px solid #eee',
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
              marginBottom: '12px',
            }}
          >
            Log Out
          </button>

          {/* Delete Account Button */}
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              width: '100%',
              padding: '14px',
              background: 'white',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Delete Account
          </button>
        </div>
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
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
            maxWidth: '480px',
            width: '100%',
            padding: '32px',
            position: 'relative',
          }}>
            {/* Close button */}
            <button
              onClick={() => setShowUpgradeModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                background: '#f5f5f5',
                cursor: 'pointer',
                fontSize: '18px',
              }}
            >
              ×
            </button>

            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', marginTop: 0 }}>
              Upgrade to Premium
            </h2>
            <p style={{ color: '#666', marginBottom: '24px', marginTop: 0 }}>
              Unlock unlimited scans and advanced features.
            </p>

            {/* Early Bird Offer - Only show if available */}
            {earlyBirdAvailable && (
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '16px',
                border: '2px solid #f59e0b',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px',
                }}>
                  <div>
                    <div style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      background: '#f59e0b',
                      color: 'white',
                      borderRadius: '100px',
                      fontSize: '11px',
                      fontWeight: '600',
                      marginBottom: '8px',
                    }}>
                      🎉 EARLY BIRD
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
                      £4.99<span style={{ fontSize: '14px', fontWeight: '400' }}>/month</span>
                    </h3>
                  </div>
                  <div style={{
                    textAlign: 'right',
                    fontSize: '13px',
                    color: '#92400e',
                  }}>
                    Only <strong>{earlyBirdSpots}</strong> spots left!
                  </div>
                </div>

                <button
                  onClick={() => handleSelectPlan('earlyBird')}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#0a0a0a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Claim Early Bird Price
                </button>
              </div>
            )}

            {/* Regular Plans */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '16px',
            }}>
              {/* Monthly */}
              <button
                onClick={() => handleSelectPlan('monthly')}
                style={{
                  padding: '20px 16px',
                  background: 'white',
                  border: '2px solid #e5e5e5',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>
                  Monthly
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>
                  £6.99<span style={{ fontSize: '14px', fontWeight: '400', color: '#666' }}>/mo</span>
                </div>
              </button>

              {/* Annual */}
              <button
                onClick={() => handleSelectPlan('annual')}
                style={{
                  padding: '20px 16px',
                  background: '#f0fdf4',
                  border: '2px solid #22c55e',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  position: 'relative',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '10px',
                  padding: '4px 8px',
                  background: '#22c55e',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '600',
                }}>
                  SAVE 42%
                </div>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>
                  Annual
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>
                  £49<span style={{ fontSize: '14px', fontWeight: '400', color: '#666' }}>/year</span>
                </div>
              </button>
            </div>

            {/* Features */}
            <div style={{ fontSize: '14px', color: '#666' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Unlimited scans
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Advanced metrics & tracking
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Priority support
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
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
            maxWidth: '420px',
            width: '100%',
            padding: '32px',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: '600', textAlign: 'center', marginBottom: '12px', marginTop: 0 }}>
              Delete Account?
            </h2>

            <p style={{
              color: '#666',
              textAlign: 'center',
              marginBottom: '24px',
              fontSize: '15px',
              lineHeight: 1.6,
              marginTop: 0,
            }}>
              This will permanently delete your account and all your data including scan history,
              progress, and settings. This action cannot be undone.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '8px' }}>
                Type <strong>DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#f5f5f5',
                  color: '#0a0a0a',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: deleteConfirmText === 'DELETE' ? '#dc2626' : '#fecaca',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed',
                  opacity: isDeleting ? 0.7 : 1,
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
