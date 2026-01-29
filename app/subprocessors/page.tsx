import Link from 'next/link';

export const metadata = {
  title: 'Subprocessors | Twacha Labs',
  description: 'Third-party services that process data on behalf of Twacha Labs',
};

export default function SubprocessorsPage() {
  const subprocessors = [
    {
      name: 'Supabase',
      purpose: 'Database & Authentication',
      location: 'Frankfurt, Germany (EU)',
      website: 'https://supabase.com',
    },
    {
      name: 'Vercel',
      purpose: 'Application Hosting',
      location: 'Global Edge Network',
      website: 'https://vercel.com',
    },
    {
      name: 'OpenAI',
      purpose: 'AI Analysis Engine',
      location: 'United States',
      website: 'https://openai.com',
    },
    {
      name: 'Stripe',
      purpose: 'Payment Processing',
      location: 'United States & Ireland',
      website: 'https://stripe.com',
    },
  ];

  const dataRights = [
    'Access your personal data',
    'Correct inaccurate data',
    'Delete your data',
    'Export your data',
    'Withdraw consent',
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafafa',
    }}>
      {/* Header */}
      <header style={{
        padding: '20px 24px',
        borderBottom: '1px solid #eee',
        background: 'white',
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Link href="/" style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#0a0a0a',
            textDecoration: 'none',
          }}>
            Twacha Labs
          </Link>
          <Link href="/" style={{
            fontSize: '14px',
            color: '#666',
            textDecoration: 'none',
          }}>
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '60px 24px 80px',
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '42px',
            fontWeight: '700',
            color: '#0a0a0a',
            marginBottom: '12px',
            letterSpacing: '-0.5px',
          }}>
            Subprocessors
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#888',
          }}>
            Last updated: January 2026
          </p>
        </div>

        {/* Intro */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          border: '1px solid #eee',
        }}>
          <p style={{
            fontSize: '16px',
            color: '#444',
            lineHeight: 1.7,
            margin: 0,
          }}>
            Twacha Labs uses trusted third-party services to deliver our skin analysis platform.
            Below is a complete list of subprocessors that may handle your data, along with their
            purpose and data storage location.
          </p>
        </div>

        {/* Subprocessors Table */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid #eee',
          marginBottom: '24px',
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1.5fr 1.2fr 0.8fr',
            padding: '16px 24px',
            background: '#fafafa',
            borderBottom: '1px solid #eee',
            gap: '16px',
          }}>
            {['Service', 'Purpose', 'Location', ''].map((header) => (
              <span key={header} style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#888',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {header}
              </span>
            ))}
          </div>

          {/* Table Rows */}
          {subprocessors.map((sp, index) => (
            <div
              key={sp.name}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1.5fr 1.2fr 0.8fr',
                padding: '20px 24px',
                borderBottom: index < subprocessors.length - 1 ? '1px solid #f0f0f0' : 'none',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <span style={{ fontWeight: '600', color: '#0a0a0a' }}>
                {sp.name}
              </span>
              <span style={{ color: '#666', fontSize: '15px' }}>
                {sp.purpose}
              </span>
              <span style={{ color: '#666', fontSize: '15px' }}>
                {sp.location}
              </span>
              <a
                href={sp.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#0a0a0a',
                  fontSize: '14px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Visit
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7V17"/>
                </svg>
              </a>
            </div>
          ))}
        </div>

        {/* How We Protect Your Data */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          border: '1px solid #eee',
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '20px',
            color: '#0a0a0a',
          }}>
            How We Protect Your Data
          </h2>

          <div style={{
            display: 'grid',
            gap: '16px',
          }}>
            {[
              {
                title: 'Encryption',
                desc: 'All data is encrypted in transit (TLS 1.3) and at rest (AES-256).',
              },
              {
                title: 'Minimal Storage',
                desc: 'Facial images are analyzed in real-time. We only store scan results if you choose to save them.',
              },
              {
                title: 'No Third-Party Sharing',
                desc: 'We never sell or share your personal data with advertisers or data brokers.',
              },
              {
                title: 'GDPR Compliant',
                desc: 'Our data practices comply with EU General Data Protection Regulation requirements.',
              },
            ].map((item) => (
              <div key={item.title} style={{
                display: 'flex',
                gap: '12px',
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#f0fdf4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div>
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#0a0a0a',
                    marginBottom: '4px',
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#666',
                    lineHeight: 1.6,
                    margin: 0,
                  }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Your Rights */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          border: '1px solid #eee',
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '20px',
            color: '#0a0a0a',
          }}>
            Your Rights
          </h2>

          <p style={{
            fontSize: '15px',
            color: '#666',
            lineHeight: 1.7,
            marginBottom: '20px',
          }}>
            Under GDPR and other privacy regulations, you have the right to:
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}>
            {dataRights.map((right) => (
              <div key={right} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                background: '#fafafa',
                borderRadius: '8px',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span style={{ fontSize: '14px', color: '#444' }}>
                  {right}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div style={{
          background: '#0a0a0a',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '12px',
            color: 'white',
          }}>
            Questions about your data?
          </h2>
          <p style={{
            fontSize: '15px',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '20px',
          }}>
            We're happy to help with any privacy-related inquiries.
          </p>
          <a
            href="mailto:privacy@twachalabs.io"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 28px',
              background: 'white',
              color: '#0a0a0a',
              borderRadius: '100px',
              fontSize: '15px',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            privacy@twachalabs.io
          </a>
        </div>

        {/* Footer Links */}
        <div style={{
          marginTop: '48px',
          paddingTop: '24px',
          borderTop: '1px solid #eee',
          display: 'flex',
          justifyContent: 'center',
          gap: '32px',
        }}>
          <Link href="/privacy" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>
            Privacy Policy
          </Link>
          <Link href="/terms" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>
            Terms of Service
          </Link>
          <Link href="/" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>
            Home
          </Link>
        </div>
      </main>
    </div>
  );
}
