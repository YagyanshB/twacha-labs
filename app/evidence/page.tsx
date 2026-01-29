import Link from 'next/link';

export const metadata = {
  title: 'Scientific Evidence | Twacha Labs',
  description: 'The science behind Twacha Labs skin analysis',
};

export default function EvidencePage() {
  // Placeholder - will be updated with real evidence later
  const comingSoonSources = [
    {
      name: 'Dermatologist Validation',
      type: 'Clinical Review',
      status: 'In Progress',
      description: 'Working with board-certified dermatologists to validate our analysis accuracy.',
    },
    {
      name: 'Skin Analysis Accuracy Study',
      type: 'Internal Research',
      status: 'Q2 2026',
      description: 'Comparing Twacha analysis results with professional dermatologist assessments.',
    },
    {
      name: 'User Outcome Tracking',
      type: 'Longitudinal Study',
      status: 'Ongoing',
      description: 'Tracking skin improvements in users following Twacha recommendations.',
    },
  ];

  const methodology = [
    {
      icon: '🔬',
      title: 'AI-Powered Analysis',
      description: 'Using GPT-4 Vision trained on dermatological literature to analyze skin characteristics.',
    },
    {
      icon: '📊',
      title: 'Multi-Factor Scoring',
      description: 'Evaluating hydration, oil control, pore health, texture, and clarity independently.',
    },
    {
      icon: '🎯',
      title: 'Personalized Insights',
      description: 'Recommendations tailored to your specific skin concerns and goals.',
    },
    {
      icon: '📈',
      title: 'Progress Tracking',
      description: 'Monitor changes over time to see what\'s working for your skin.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white' }}>
      {/* Header */}
      <header style={{
        padding: '20px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: '600' }}>
            Twacha Labs
          </Link>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px' }}>
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        padding: '80px 24px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(245,158,11,0.1) 0%, transparent 100%)',
      }}>
        <div style={{
          display: 'inline-block',
          padding: '8px 16px',
          background: 'rgba(245,158,11,0.2)',
          borderRadius: '100px',
          fontSize: '13px',
          color: '#f59e0b',
          marginBottom: '24px',
        }}>
          ○ Building Trust Through Science
        </div>

        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          marginBottom: '16px',
        }}>
          Our <span style={{ color: '#f59e0b' }}>Methodology</span>
        </h1>

        <p style={{
          fontSize: '18px',
          color: 'rgba(255,255,255,0.7)',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: 1.6,
        }}>
          Twacha Labs combines advanced AI with dermatological principles to provide
          accurate, actionable skin insights.
        </p>
      </section>

      {/* How It Works */}
      <section style={{
        padding: '60px 24px',
        maxWidth: '1000px',
        margin: '0 auto',
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '600',
          textAlign: 'center',
          marginBottom: '48px',
        }}>
          How Our Analysis Works
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
        }}>
          {methodology.map((item) => (
            <div key={item.title} style={{
              padding: '28px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>{item.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Evidence Coming Soon */}
      <section style={{
        padding: '60px 24px',
        maxWidth: '1000px',
        margin: '0 auto',
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '24px',
          padding: '48px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '12px' }}>
              Clinical Validation
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>
              We're actively working with dermatologists to validate our technology.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {comingSoonSources.map((source) => (
              <div key={source.name} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 24px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div>
                  <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>{source.name}</h4>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
                    {source.description}
                  </p>
                </div>
                <div style={{
                  padding: '6px 14px',
                  background: source.status === 'In Progress' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.1)',
                  color: source.status === 'In Progress' ? '#f59e0b' : 'rgba(255,255,255,0.7)',
                  borderRadius: '100px',
                  fontSize: '13px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                }}>
                  {source.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section style={{
        padding: '40px 24px 80px',
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <div style={{
          padding: '24px',
          background: 'rgba(239,68,68,0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(239,68,68,0.2)',
        }}>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>
            <strong>Important:</strong> Twacha Labs is a cosmetic skin analysis tool, not a medical device.
            It cannot diagnose skin diseases, cancer, or medical conditions. Always consult a
            board-certified dermatologist for medical concerns.
          </p>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{
        padding: '60px 24px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(245,158,11,0.1) 100%)',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '16px' }}>
          Try Twacha Labs Today
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
          Get your free skin analysis in under 60 seconds.
        </p>
        <Link href="/login" style={{
          display: 'inline-block',
          padding: '16px 32px',
          background: '#f59e0b',
          color: '#0a0a0a',
          borderRadius: '100px',
          fontSize: '16px',
          fontWeight: '600',
          textDecoration: 'none',
        }}>
          Start Free Scan
        </Link>
      </section>
    </div>
  );
}
