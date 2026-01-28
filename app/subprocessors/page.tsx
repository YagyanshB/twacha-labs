'use client';

import Link from 'next/link';

const subprocessors = [
  {
    name: 'Supabase',
    purpose: 'Database hosting and authentication',
    location: 'European Union (Frankfurt)',
    website: 'https://supabase.com',
  },
  {
    name: 'Vercel',
    purpose: 'Frontend hosting and deployment',
    location: 'Global CDN (EU primary)',
    website: 'https://vercel.com',
  },
  {
    name: 'OpenAI',
    purpose: 'AI skin analysis (GPT-4o Vision)',
    location: 'United States',
    website: 'https://openai.com',
  },
  {
    name: 'Stripe',
    purpose: 'Payment processing',
    location: 'United States / Ireland',
    website: 'https://stripe.com',
  },
];

export default function SubprocessorsPage() {
  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '60px 24px',
      minHeight: '100vh',
      background: '#fafafa',
    }}>
      {/* Header */}
      <h1 style={{
        fontSize: '48px',
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: '16px',
        color: '#0a0a0a',
      }}>
        Twacha Labs Subprocessors
      </h1>

      <p style={{
        textAlign: 'center',
        color: '#888',
        marginBottom: '16px',
        fontSize: '14px',
      }}>
        Current as of January 2026
      </p>

      <p style={{
        textAlign: 'center',
        color: '#666',
        fontSize: '18px',
        maxWidth: '600px',
        margin: '0 auto 48px',
        lineHeight: 1.6,
      }}>
        Know exactly where your data is and how it's being used.
        <br />
        Twacha Labs' subprocessors.
      </p>

      {/* Table */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #eee',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        {/* Header Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr 1fr 1fr',
          padding: '16px 24px',
          borderBottom: '1px solid #eee',
          background: '#fafafa',
        }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase' }}>
            Name
          </span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase' }}>
            Purpose
          </span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase' }}>
            Location
          </span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase' }}>
            Website
          </span>
        </div>

        {/* Data Rows */}
        {subprocessors.map((sp, index) => (
          <div
            key={sp.name}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr 1fr 1fr',
              padding: '20px 24px',
              borderBottom: index < subprocessors.length - 1 ? '1px solid #eee' : 'none',
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: '600', color: '#0a0a0a' }}>{sp.name}</span>
            <span style={{ color: '#666', fontSize: '15px' }}>{sp.purpose}</span>
            <span style={{ color: '#666', fontSize: '15px' }}>{sp.location}</span>
            <a
              href={sp.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#0066cc', textDecoration: 'none', fontSize: '14px' }}
            >
              Visit →
            </a>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div style={{
        marginTop: '48px',
        padding: '32px',
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #eee',
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#0a0a0a' }}>
          Data Protection
        </h3>
        <p style={{ color: '#666', lineHeight: 1.8, marginBottom: '20px', fontSize: '15px' }}>
          Twacha Labs is committed to protecting your data. We process facial images
          for skin analysis purposes only. Images are analyzed in real-time and are
          not stored permanently unless you explicitly save a scan to your account.
        </p>
        <p style={{ color: '#666', lineHeight: 1.8, marginBottom: '20px', fontSize: '15px' }}>
          All data processing complies with GDPR regulations. Your data is encrypted
          in transit and at rest. We never sell or share your personal information
          with third parties for marketing purposes.
        </p>
        <p style={{ color: '#666', lineHeight: 1.8, fontSize: '15px' }}>
          For questions about data processing, contact us at{' '}
          <a href="mailto:privacy@twachalabs.io" style={{ color: '#0066cc', textDecoration: 'none' }}>
            privacy@twachalabs.io
          </a>
        </p>
      </div>

      {/* Data Rights */}
      <div style={{
        marginTop: '32px',
        padding: '32px',
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #eee',
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#0a0a0a' }}>
          Your Data Rights
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {[
            'Right to access your data',
            'Right to rectification of inaccurate data',
            'Right to erasure (delete your account and all data)',
            'Right to data portability (export your data)',
            'Right to object to processing',
            'Right to withdraw consent at any time',
          ].map((right, i) => (
            <li key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
              fontSize: '15px',
              color: '#666',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {right}
            </li>
          ))}
        </ul>
      </div>

      {/* Back Link */}
      <div style={{ textAlign: 'center', marginTop: '48px' }}>
        <Link
          href="/"
          style={{
            color: '#666',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '15px',
            transition: 'color 0.2s ease',
          }}
        >
          ← Back to Twacha Labs
        </Link>
      </div>
    </div>
  );
}
