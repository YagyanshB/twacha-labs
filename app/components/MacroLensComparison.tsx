'use client';

import { useState } from 'react';

export default function MacroLensComparison() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [activeDemo, setActiveDemo] = useState<'blackheads' | 'pores' | 'texture'>('blackheads');

  const demos = {
    blackheads: {
      title: 'Blackhead Detection',
      before: { accuracy: '23%', found: '3 visible' },
      after: { accuracy: '94%', found: '12 detected' },
    },
    pores: {
      title: 'Pore Analysis',
      before: { accuracy: '31%', found: 'Unclear' },
      after: { accuracy: '97%', found: '47 mapped' },
    },
    texture: {
      title: 'Skin Texture',
      before: { accuracy: '18%', found: 'Hidden' },
      after: { accuracy: '91%', found: '3 areas found' },
    },
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(5, Math.min(95, x)));
  };

  return (
    <section style={{
      padding: '80px 24px',
      background: 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)',
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#0a0a0a',
            color: 'white',
            borderRadius: '100px',
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '20px',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
            15x Macro Lens Technology
          </span>

          <h2 style={{
            fontSize: 'clamp(28px, 5vw, 42px)',
            fontWeight: '700',
            letterSpacing: '-0.02em',
            marginBottom: '16px',
            color: '#0a0a0a',
          }}>
            See What Your Camera Can't
          </h2>

          <p style={{
            fontSize: '18px',
            color: '#666',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            Clinical-grade skin analysis from your phone. Our macro lens reveals
            details invisible to the naked eye.
          </p>
        </div>

        {/* Demo Selector Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '32px',
          flexWrap: 'wrap',
        }}>
          {Object.entries(demos).map(([key, demo]) => (
            <button
              key={key}
              onClick={() => setActiveDemo(key as keyof typeof demos)}
              style={{
                padding: '12px 24px',
                background: activeDemo === key ? '#0a0a0a' : 'white',
                color: activeDemo === key ? 'white' : '#666',
                border: activeDemo === key ? 'none' : '1px solid #e5e5e5',
                borderRadius: '100px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeDemo === key ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              {demo.title}
            </button>
          ))}
        </div>

        {/* Comparison Card */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
        }}>
          {/* Image Comparison Area */}
          <div
            onMouseMove={handleMouseMove}
            onTouchMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
              setSliderPosition(Math.max(5, Math.min(95, x)));
            }}
            style={{
              position: 'relative',
              height: '400px',
              cursor: 'ew-resize',
              background: '#1a1a1a',
            }}
          >
            {/* Before Side - Blurry/Regular Camera */}
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {/* Simulated blurry skin - use actual images in production */}
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #d4a574 0%, #c4956a 100%)',
                filter: 'blur(2px)',
                opacity: 0.9,
              }} />

              {/* Before Label */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(8px)',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Regular Camera
              </div>

              {/* Quality Badge */}
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                background: 'rgba(239, 68, 68, 0.9)',
                color: 'white',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Low Detail
              </div>
            </div>

            {/* After Side - Clear/Macro Lens */}
            <div style={{
              position: 'absolute',
              inset: 0,
              clipPath: `inset(0 0 0 ${sliderPosition}%)`,
            }}>
              {/* Simulated detailed macro view - use actual images in production */}
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #ddb896 0%, #c9a07a 100%)',
                position: 'relative',
              }}>
                {/* Simulated blackhead dots for demo */}
                {activeDemo === 'blackheads' && [...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: `${20 + (i % 4) * 20}%`,
                      top: `${25 + Math.floor(i / 4) * 25}%`,
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#3d3530',
                      boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.2)',
                    }}
                  />
                ))}
              </div>

              {/* After Label */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(8px)',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                  <circle cx="11" cy="11" r="3"/>
                </svg>
                15x Macro Lens
              </div>

              {/* Detection Badge */}
              <div style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                background: 'rgba(34, 197, 94, 0.9)',
                color: 'white',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {demos[activeDemo].after.found}
              </div>
            </div>

            {/* Slider Line */}
            <div style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${sliderPosition}%`,
              width: '3px',
              background: 'white',
              transform: 'translateX(-50%)',
              boxShadow: '0 0 20px rgba(0,0,0,0.5)',
              zIndex: 10,
            }}>
              {/* Handle */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.5">
                  <path d="M8 12H16M8 12L10 9M8 12L10 15M16 12L14 9M16 12L14 15"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Stats Comparison */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
          }}>
            {/* Before Stats */}
            <div style={{
              padding: '28px',
              borderRight: '1px solid #eee',
              background: '#fafafa',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px',
                color: '#888',
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Regular Camera
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>
                  Detection Accuracy
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    flex: 1,
                    height: '10px',
                    background: '#e5e5e5',
                    borderRadius: '5px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: demos[activeDemo].before.accuracy,
                      height: '100%',
                      background: '#ef4444',
                      borderRadius: '5px',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: '#ef4444', minWidth: '50px' }}>
                    {demos[activeDemo].before.accuracy}
                  </span>
                </div>
              </div>

              <div style={{
                padding: '14px',
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #eee',
              }}>
                <div style={{ fontSize: '12px', color: '#888' }}>Issues Found</div>
                <div style={{ fontSize: '22px', fontWeight: '600', marginTop: '4px' }}>
                  {demos[activeDemo].before.found}
                </div>
              </div>
            </div>

            {/* After Stats */}
            <div style={{ padding: '28px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px',
                color: '#0a0a0a',
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: '600',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                  <circle cx="11" cy="11" r="3"/>
                </svg>
                15x Macro Lens
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>
                  Detection Accuracy
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    flex: 1,
                    height: '10px',
                    background: '#e5e5e5',
                    borderRadius: '5px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: demos[activeDemo].after.accuracy,
                      height: '100%',
                      background: '#22c55e',
                      borderRadius: '5px',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: '#22c55e', minWidth: '50px' }}>
                    {demos[activeDemo].after.accuracy}
                  </span>
                </div>
              </div>

              <div style={{
                padding: '14px',
                background: '#f0fdf4',
                borderRadius: '12px',
                border: '1px solid #bbf7d0',
              }}>
                <div style={{ fontSize: '12px', color: '#166534' }}>Issues Found</div>
                <div style={{ fontSize: '22px', fontWeight: '600', color: '#166534', marginTop: '4px' }}>
                  {demos[activeDemo].after.found}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Card */}
        <div style={{
          marginTop: '40px',
          background: '#0a0a0a',
          borderRadius: '20px',
          padding: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
        }}>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>
              Twacha Labs Macro Kit
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '400px', fontSize: '15px' }}>
              Universal clip-on 15x lens with LED ring light. Works with any smartphone.
            </p>
            <div style={{ display: 'flex', gap: '20px', marginTop: '16px', flexWrap: 'wrap' }}>
              {['15x magnification', 'LED ring light', 'Universal fit'].map((feature, i) => (
                <span key={i} style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', textDecoration: 'line-through' }}>
              £29.99
            </div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '12px' }}>
              £19.99
            </div>
            <button style={{
              padding: '14px 32px',
              background: 'white',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: '100px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              Get the Kit
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
