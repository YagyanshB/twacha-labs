'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import FaceIDScanner from './components/FaceIDScanner';
import EmailGate from './components/EmailGate';
import ResultsDashboard from './components/ResultsDashboard';
import ProductModal from './components/ProductModal';
import MacroLensComparison from './components/MacroLensComparison';

type FunnelState = 'landing' | 'scanning' | 'analyzing' | 'email-gate' | 'results';

interface AnalysisResult {
  score: number;
  verdict: string;
  analysis: string;
  recommendation: string;
  imagePath?: string | null;
}

export default function Home() {
  const [funnelState, setFunnelState] = useState<FunnelState>('landing');
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [userData, setUserData] = useState<{ photo: string; skinType: string; age: string } | null>(null);

  const handleStartScan = () => {
    // Allow anonymous scanning - no login required
    window.location.href = '/analysis';
  };


  const handleAnalysis = async (images: string[]) => {
    setCapturedImages(images);
    setFunnelState('analyzing');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          images, 
          email: null,
          skinType: userData?.skinType,
          age: userData?.age,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      
      // Map API response to component-expected format
      // API returns: { verdict, diagnosis, confidence, imageUrls, imagePath }
      // Components expect: { score, verdict, analysis, recommendation, imagePath }
      const mappedResult: AnalysisResult = {
        score: Math.round((data.confidence || 0.7) * 100), // Convert confidence (0-1) to score (0-100)
        verdict: data.verdict || 'UNKNOWN',
        analysis: data.diagnosis || 'Analysis completed',
        recommendation: getRecommendationFromVerdict(data.verdict),
        imagePath: data.imagePath || data.imageUrls?.[0] || null,
      };
      
      setAnalysisResult(mappedResult);
      setFunnelState('email-gate');
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisResult({
        score: 65,
        verdict: 'CAUTION',
        analysis: 'Unable to complete analysis. Please try again.',
        recommendation: 'The Founder\'s Kit',
      });
      setFunnelState('email-gate');
    }
  };

  const handleScanComplete = async (images: string[]) => {
    // Combine with photo from flow if available
    const allImages = userData?.photo ? [userData.photo, ...images] : images;
    handleAnalysis(allImages);
  };

  // Helper function to generate recommendation based on verdict
  const getRecommendationFromVerdict = (verdict: string): string => {
    switch (verdict) {
      case 'CLEAR':
        return 'Maintenance Routine';
      case 'POP':
        return 'Extraction Protocol';
      case 'STOP':
        return 'Professional Consultation Recommended';
      case 'DOCTOR':
        return 'Professional Evaluation Recommended';
      default:
        return 'The Founder\'s Kit';
    }
  };

  const handleEmailSubmit = async (email: string) => {
    setUserEmail(email);
    
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (analysisResult?.imagePath) {
        try {
          await fetch('/api/scan-logs/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              email, 
              imagePath: analysisResult.imagePath 
            }),
          });
        } catch (updateError) {
          console.error('Scan log update error:', updateError);
        }
      }
    } catch (error) {
      console.error('Email save error:', error);
    }

    setFunnelState('results');
  };

  return (
    <div className="min-h-screen bg-white">
      <AnimatePresence mode="wait">
        {funnelState === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Navbar onStartScan={handleStartScan} />
            <HeroSection onStartScan={handleStartScan} />
            <DemoSection onStartScan={handleStartScan} />
            <BenefitsSection />
            <MacroLensComparison />
            <ReportPreviewSection onStartScan={handleStartScan} />
            <FinalCTASection onStartScan={handleStartScan} />
            <Footer />
          </motion.div>
        )}

        {funnelState === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <FaceIDScanner
              onComplete={handleScanComplete}
              onBack={() => setFunnelState('landing')}
            />
          </motion.div>
        )}

        {funnelState === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center bg-white"
          >
            <AnalysisLoading />
          </motion.div>
        )}

        {funnelState === 'email-gate' && analysisResult && (
          <motion.div
            key="email-gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmailGate
              analysisResult={analysisResult}
              onSubmit={handleEmailSubmit}
            />
          </motion.div>
        )}

        {funnelState === 'results' && analysisResult && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ResultsDashboard
              analysisResult={analysisResult}
              email={userEmail}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />
    </div>
  );
}

// Navigation
function Navbar({ onStartScan }: { onStartScan: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav style={{
        position: 'sticky',
        top: 0,
        background: 'white',
        borderBottom: '1px solid #eee',
        zIndex: 100,
        padding: '16px 20px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            color: '#0a0a0a',
          }}>
            <svg width="35" height="35" viewBox="0 0 40 40">
              <g transform="translate(10, 10)" fill="#000">
                <circle cx="10" cy="10" r="2"/>
                <circle cx="10" cy="4" r="1.5" opacity="0.8"/>
                <circle cx="16" cy="10" r="1.5" opacity="0.8"/>
                <circle cx="10" cy="16" r="1.5" opacity="0.8"/>
                <circle cx="4" cy="10" r="1.5" opacity="0.8"/>
                <circle cx="6" cy="6" r="1" fill="#0066ff"/>
                <circle cx="14" cy="6" r="1" fill="#0066ff"/>
                <circle cx="14" cy="14" r="1" fill="#0066ff"/>
                <circle cx="6" cy="14" r="1" fill="#0066ff"/>
                <path d="M4 10 L16 10 M10 4 L10 16" stroke="#000" strokeWidth="0.5" opacity="0.3"/>
              </g>
            </svg>
            <span style={{ fontWeight: '600', fontSize: '18px' }}>Twacha Labs</span>
          </a>

          {/* Desktop: Show full nav */}
          <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="#how" onClick={(e) => { e.preventDefault(); document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
              How it works
            </a>
            <a href="/pricing" onClick={(e) => { e.preventDefault(); window.location.href = '/pricing'; }} style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
              Pricing
            </a>
            <Link href="/login" style={{
              padding: '10px 20px',
              background: '#0a0a0a',
              color: 'white',
              border: 'none',
              borderRadius: '100px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              textDecoration: 'none',
            }}>
              Start Free Scan
            </Link>
          </div>

          {/* Mobile: Hamburger only */}
          <button
            className="mobile-only"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              padding: '8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2">
              {menuOpen ? <path d="M18 6L6 18M6 6l12 12"/> : <path d="M3 12h18M3 6h18M3 18h18"/>}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: '60px',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'white',
          zIndex: 99,
          padding: '24px 20px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <a href="#how" onClick={(e) => { e.preventDefault(); setMenuOpen(false); document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' }); }}
              style={{ fontSize: '18px', color: '#0a0a0a', textDecoration: 'none', padding: '12px 0' }}>
              How it works
            </a>
            <a href="/pricing" onClick={(e) => { e.preventDefault(); setMenuOpen(false); window.location.href = '/pricing'; }}
              style={{ fontSize: '18px', color: '#0a0a0a', textDecoration: 'none', padding: '12px 0' }}>
              Pricing
            </a>
            <Link href="/login" onClick={() => setMenuOpen(false)}
              style={{
                width: '100%',
                padding: '16px',
                background: '#0a0a0a',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                marginTop: '12px',
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block',
              }}
            >
              Start Free Scan
            </Link>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: block !important; }
        }
        @media (min-width: 769px) {
          .desktop-only { display: flex !important; }
          .mobile-only { display: none !important; }
        }
      `}</style>
    </>
  );
}

// Hero Section
function HeroSection({ onStartScan }: { onStartScan: () => void }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>
          Your skin,
          <span>decoded in seconds</span>
        </h1>
        <p>AI-powered analysis designed specifically for men's skin. No BS, just results.</p>
        <div className="hero-cta">
          <Link href="/login" className="primary-cta">Start Free Scan</Link>
          <a href="#report" className="secondary-cta" onClick={(e) => { e.preventDefault(); document.getElementById('report')?.scrollIntoView({ behavior: 'smooth' }); }}>
            View sample report
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

// Demo Section
function DemoSection({ onStartScan }: { onStartScan: () => void }) {
  return (
    <section className="demo-section" id="how">
      <div className="demo-container">
        <div className="demo-content">
          <h2>Scan. Analyse. Improve.</h2>
          <p>One selfie gives you everything you need to know about your skin. Our AI identifies issues you can't see and provides a personalised routine that actually works.</p>
          <Link href="/login" className="primary-cta" style={{ background: 'white', color: 'black' }}>Start Free Scan</Link>
        </div>
        <div className="demo-visual">
          <div className="phone-mockup">
            <div className="phone-screen">
              <div className="face-scan-container">
                <div className="face-outline">
                  <svg viewBox="0 0 200 240" style={{ width: '140px', height: '170px' }}>
                    <ellipse cx="100" cy="120" rx="70" ry="90" fill="none" stroke="#ddd" strokeWidth="2" strokeDasharray="5,5" opacity="0.5"/>
                    <circle cx="70" cy="100" r="3" fill="#0066ff" opacity="0">
                      <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0s"/>
                    </circle>
                    <circle cx="130" cy="100" r="3" fill="#0066ff" opacity="0">
                      <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.2s"/>
                    </circle>
                    <circle cx="100" cy="130" r="3" fill="#0066ff" opacity="0">
                      <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.4s"/>
                    </circle>
                    <circle cx="85" cy="140" r="3" fill="#0066ff" opacity="0">
                      <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.6s"/>
                    </circle>
                    <circle cx="115" cy="140" r="3" fill="#0066ff" opacity="0">
                      <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.8s"/>
                    </circle>
                    <line x1="30" y1="0" x2="170" y2="0" stroke="#0066ff" strokeWidth="2" opacity="0.3">
                      <animateTransform attributeName="transform" type="translate" from="0 30" to="0 210" dur="2s" repeatCount="indefinite"/>
                    </line>
                  </svg>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ width: '40px', height: '4px', background: '#0066ff', borderRadius: '2px' }}></div>
                    <div style={{ width: '40px', height: '4px', background: '#0066ff', borderRadius: '2px', opacity: 0.5 }}></div>
                    <div style={{ width: '40px', height: '4px', background: '#ddd', borderRadius: '2px' }}></div>
                  </div>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>Analysing skin texture...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Benefits Section
function BenefitsSection() {
  return (
    <section className="benefits">
      <div className="benefits-container">
        <h2>Here's what makes us different</h2>
        <div className="benefit-cards">
          <div className="benefit-card">
            <div className="benefit-number" style={{ color: '#e0e0e0' }}>01</div>
            <h3>Built for men</h3>
            <p>Our AI is trained specifically on male skin patterns. Thicker skin, daily shaving, higher oil production - we get it.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-number" style={{ color: '#e0e0e0' }}>02</div>
            <h3>Instant results</h3>
            <p>No waiting rooms, no appointments. Get professional-grade analysis in under 30 seconds from your phone.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-number" style={{ color: '#e0e0e0' }}>03</div>
            <h3>Actually works</h3>
            <p>Recommendations based on clinical research, not marketing. Simple routines you'll actually stick to.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Report Preview Section
function ReportPreviewSection({ onStartScan }: { onStartScan: () => void }) {
  return (
    <section className="report-preview-section" id="report">
      <div className="report-container">
        <h2>See what you'll get</h2>
        <p>A complete skin analysis with actionable recommendations</p>
        
        <div className="report-mockup">
          <div className="report-header">
            <div className="report-title">
              <h3>Skin Analysis Report</h3>
              <p className="report-date">Generated 08 January 2026</p>
            </div>
            <div className="skin-score">
              <div className="score-number">78</div>
              <div className="score-label">Skin health score</div>
            </div>
          </div>

          <div className="report-insights">
            <div className="insight-row">
              <span className="insight-label">Skin type</span>
              <span className="insight-value">Combination (oily T-zone)</span>
            </div>
            <div className="insight-row">
              <span className="insight-label">Primary concern</span>
              <span className="insight-value">Excess oil production</span>
            </div>
            <div className="insight-row">
              <span className="insight-label">Secondary concern</span>
              <span className="insight-value">Early signs of sun damage</span>
              </div>
            <div className="insight-row">
              <span className="insight-label">Hydration level</span>
              <span className="insight-value">Adequate</span>
              </div>
            <div className="insight-row">
              <span className="insight-label">Recommended routine</span>
              <span className="insight-value">3-step morning, 4-step evening</span>
            </div>
          </div>

          <div className="report-cta">
            <Link href="/login" className="primary-cta">Start Free Scan</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// Final CTA Section
function FinalCTASection({ onStartScan }: { onStartScan: () => void }) {
  return (
    <section className="final-cta">
      <h2>Ready to level up your skin?</h2>
      <p>Join thousands of men taking control of their skin health. Free analysis, no commitment.</p>
      <Link href="/login" className="primary-cta">Start Free Scan</Link>
    </section>
  );
}

// Footer - Responsive
function Footer() {
  return (
    <footer style={{
      background: '#0a0a0a',
      padding: '40px 20px',
      color: 'white',
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>
          Twacha Labs
        </h3>

        {/* Links - Use flex-wrap to prevent breaking */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '16px 24px', // row gap, column gap
          marginBottom: '24px',
        }}>
          <Link href="/privacy" style={{
            color: 'rgba(255,255,255,0.7)',
            textDecoration: 'none',
            fontSize: '14px',
            whiteSpace: 'nowrap', // Prevent text breaking
          }}>
            Privacy
          </Link>
          <Link href="/terms" style={{
            color: 'rgba(255,255,255,0.7)',
            textDecoration: 'none',
            fontSize: '14px',
            whiteSpace: 'nowrap',
          }}>
            Terms
          </Link>
          <Link href="/subprocessors" style={{
            color: 'rgba(255,255,255,0.7)',
            textDecoration: 'none',
            fontSize: '14px',
            whiteSpace: 'nowrap',
          }}>
            Subprocessors
          </Link>
          <Link href="/contact" style={{
            color: 'rgba(255,255,255,0.7)',
            textDecoration: 'none',
            fontSize: '14px',
            whiteSpace: 'nowrap',
          }}>
            Contact
          </Link>
        </div>

        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
          © 2026 Twacha Labs. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

// Analysis Loading Component
function AnalysisLoading() {
  return (
    <div className="text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-[#0066ff] border-t-transparent rounded-full mx-auto mb-6"
      />
      <h2 className="text-2xl font-bold text-[#333333] mb-2">Analyzing Skin Integrity...</h2>
      <p className="text-[#666666]">Processing your scan</p>
    </div>
  );
}
