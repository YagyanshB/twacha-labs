'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [scansRemaining, setScansRemaining] = useState<number>(5);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUserAndScans = useCallback(async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('monthly_scans_used, is_premium')
          .eq('id', currentUser.id)
          .single();

        if (profile && !error) {
          setIsPremium(profile.is_premium || false);
          if (profile.is_premium) {
            setScansRemaining(999);
          } else {
            setScansRemaining(Math.max(0, 5 - (profile.monthly_scans_used || 0)));
          }
          console.log('Header: Scans remaining:', Math.max(0, 5 - (profile.monthly_scans_used || 0)));
        }
      }
    } catch (error) {
      console.error('Error fetching user/scans:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchUserAndScans();
  }, [fetchUserAndScans]);

  // Refetch when pathname changes (e.g., after completing a scan)
  useEffect(() => {
    fetchUserAndScans();
  }, [pathname, fetchUserAndScans]);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserAndScans();
    });

    return () => subscription.unsubscribe();
  }, [fetchUserAndScans]);

  // Subscribe to real-time profile updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`profile-header-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔄 Header: Profile updated via realtime:', payload.new);
          const newProfile = payload.new as any;
          if (newProfile.is_premium) {
            setScansRemaining(999);
            setIsPremium(true);
          } else {
            setScansRemaining(Math.max(0, 5 - (newProfile.monthly_scans_used || 0)));
            setIsPremium(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  if (loading) {
    return (
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid #eee',
        background: 'white',
      }}>
        <Link href="/" style={{ fontSize: '18px', fontWeight: '600', textDecoration: 'none', color: '#0a0a0a' }}>
          Twacha Labs
        </Link>
      </header>
    );
  }

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      borderBottom: '1px solid #eee',
      background: 'white',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link href="/" style={{ fontSize: '18px', fontWeight: '600', textDecoration: 'none', color: '#0a0a0a' }}>
        Twacha Labs
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user ? (
          <>
            {/* Scan Counter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isPremium ? (
                <span style={{ fontSize: '14px', color: '#22c55e', fontWeight: '500' }}>∞ Unlimited</span>
              ) : (
                <>
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: i < scansRemaining ? '#0a0a0a' : '#e5e5e5',
                      }}
                    />
                  ))}
                  <span style={{ fontSize: '14px', color: '#666', marginLeft: '4px' }}>
                    {scansRemaining} left
                  </span>
                </>
              )}
            </div>

            {/* New Scan Button */}
            <button
              onClick={() => router.push('/analysis')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: '#0a0a0a',
                color: 'white',
                border: 'none',
                borderRadius: '100px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              New Scan
            </button>

            {/* Profile Avatar */}
            <button
              onClick={() => router.push('/dashboard/settings')}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#0a0a0a',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              {user.email?.[0]?.toUpperCase() || 'U'}
            </button>
          </>
        ) : (
          <>
            {/* Not logged in */}
            <button
              onClick={() => router.push('/login')}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                color: '#0a0a0a',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/login')}
              style={{
                padding: '10px 20px',
                background: '#f59e0b',
                color: '#0a0a0a',
                border: 'none',
                borderRadius: '100px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Get Started
            </button>
          </>
        )}
      </div>
    </header>
  );
}
