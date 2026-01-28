'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface AuthGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGate({ children, fallback }: AuthGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return fallback || <SignUpPrompt />;
  }

  return <>{children}</>;
}

// Sign up prompt component
function SignUpPrompt() {
  const router = useRouter();

  return (
    <div style={{
      textAlign: 'center',
      padding: '60px 24px',
      background: 'linear-gradient(180deg, #f9fafb 0%, white 100%)',
      borderRadius: '24px',
      border: '1px solid #eee',
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px',
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="1.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>

      <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px', color: '#0a0a0a' }}>
        Sign up to see your results
      </h2>

      <p style={{ color: '#666', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px', lineHeight: 1.6, fontSize: '15px' }}>
        Create a free account to view your full skin analysis, track progress, and get personalized recommendations.
      </p>

      <button
        onClick={() => router.push('/login')}
        style={{
          padding: '16px 48px',
          background: '#0a0a0a',
          color: 'white',
          border: 'none',
          borderRadius: '100px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
        }}
      >
        Create Free Account
      </button>

      <p style={{ fontSize: '14px', color: '#888', marginTop: '16px' }}>
        Already have an account?{' '}
        <a href="/login" style={{ color: '#0a0a0a', fontWeight: '500', textDecoration: 'none' }}>Sign in</a>
      </p>
    </div>
  );
}
