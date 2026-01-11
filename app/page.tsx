'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FaceIDScanner from './components/FaceIDScanner';
import EmailGate from './components/EmailGate';
import ResultsDashboard from './components/ResultsDashboard';
import ProductModal from './components/ProductModal';

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
    // Redirect to analysis page with new StartFreeFlow
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
            <ProductSection onOpenModal={() => setIsProductModalOpen(true)} />
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
  return (
    <nav>
      <div className="nav-container">
        <a href="#" className="logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <svg className="logo-mark" viewBox="0 0 40 40">
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
          <span className="logo-text">Twacha Labs</span>
        </a>
        <div className="nav-right">
          <ul className="nav-links">
            <li><a href="#how" onClick={(e) => { e.preventDefault(); document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' }); }}>How it works</a></li>
            <li><a href="/pricing" onClick={(e) => { e.preventDefault(); window.location.href = '/pricing'; }}>Pricing</a></li>
          </ul>
          <button onClick={onStartScan} className="scan-button">Start free</button>
        </div>
      </div>
    </nav>
  );
}

// Hero Section with Clinical Comparison
function HeroSection({ onStartScan }: { onStartScan: () => void }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-6">
          Precision Dermal Analysis for Men.
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-4">
          Stop guessing. Use clinical-grade computer vision and 15x macro-imaging to optimize your skin health. Built by AI engineers with NHS experience.
        </p>
        
        {/* System Badge */}
        <div className="flex justify-center mb-8">
          <span className="border border-green-100 bg-green-50/50 text-green-700 font-mono text-[10px] px-2 py-0.5 rounded-full">
            SYSTEM: OPERATIONAL
          </span>
        </div>

        {/* Clinical Comparison */}
        <div className="max-w-5xl mx-auto mb-8 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard View Card */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col gap-3">
              <div className="flex gap-4 justify-center items-center">
                <span className="font-mono text-xs text-gray-600">[MODE: STANDARD_RGB]</span>
                <span className="font-mono text-xs text-gray-600">[ZOOM: 1X]</span>
              </div>
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <div className="w-full h-full flex items-center justify-center">
                  <svg viewBox="0 0 400 400" fill="none" className="w-full h-full">
                    <rect width="400" height="400" fill="#f3f4f6"/>
                    <circle cx="200" cy="200" r="80" fill="#d1d5db" opacity="0.5"/>
                    <text x="200" y="200" textAnchor="middle" fill="#9ca3af" fontSize="16" fontFamily="system-ui">Standard Selfie</text>
                  </svg>
                </div>
                <div className="absolute inset-0 bg-white/30 pointer-events-none"></div>
                <div className="absolute inset-0 backdrop-blur-sm pointer-events-none"></div>
              </div>
            </div>

            {/* Twacha Macro View Card */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col gap-3">
              <div className="flex gap-4 justify-center items-center">
                <span className="font-mono text-xs text-gray-600">[MODE: TWACHA_MACRO]</span>
                <span className="font-mono text-xs text-gray-600">[ZOOM: 15X]</span>
              </div>
              <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-800">
                <div className="w-full h-full flex items-center justify-center">
                  <svg viewBox="0 0 400 400" fill="none" className="w-full h-full">
                    <rect width="400" height="400" fill="#1f2937"/>
                    <rect x="150" y="150" width="100" height="100" fill="#374151" stroke="#10b981" strokeWidth="2"/>
                    <circle cx="200" cy="200" r="30" fill="#4b5563"/>
                    <circle cx="200" cy="200" r="15" fill="#6b7280"/>
                    <text x="200" y="250" textAnchor="middle" fill="#10b981" fontSize="12" fontFamily="monospace">15x MACRO</text>
                  </svg>
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2/5 h-2/5 border-2 border-green-500 rounded shadow-[0_0_0_2px_rgba(16,185,129,0.2)] pointer-events-none"></div>
                {/* Scanning Animation Line */}
                <div className="absolute left-0 right-0 h-0.5 bg-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.6),0_0_16px_rgba(59,130,246,0.4)] pointer-events-none animate-scan-down"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-cta">
          <button onClick={onStartScan} className="primary-cta">Start free scan</button>
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
          <button onClick={onStartScan} className="primary-cta" style={{ background: 'white', color: 'black' }}>Start free analysis</button>
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

// Product Section - Coming Soon
function ProductSection({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <section className="product-section" style={{ background: '#18181b', padding: '5rem 2rem', borderTop: '1px solid #27272a' }}>
      <div className="product-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ color: '#a1a1aa', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Coming Soon</span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginTop: '0.5rem', marginBottom: '1rem', color: '#fff' }}>
            Twacha Pro Kit
          </h2>
          <p style={{ color: '#a1a1aa', maxWidth: '42rem', margin: '0 auto' }}>
            Professional-grade hardware for clinic-level analysis at home. 
            Join the waitlist for early access.
          </p>
            </div>

        <div style={{ maxWidth: '28rem', margin: '0 auto', background: '#000', border: '1px solid #27272a', borderRadius: '0.75rem', padding: '2rem' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#d4d4d8' }}>
              <svg className="w-5 h-5" style={{ width: '1.25rem', height: '1.25rem', color: '#71717a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Medical-grade imaging
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#d4d4d8' }}>
              <svg className="w-5 h-5" style={{ width: '1.25rem', height: '1.25rem', color: '#71717a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Hospital-level accuracy
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#d4d4d8' }}>
              <svg className="w-5 h-5" style={{ width: '1.25rem', height: '1.25rem', color: '#71717a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Includes 1 year premium
                  </li>
              </ul>

          <button 
              onClick={onOpenModal}
            style={{ 
              width: '100%', 
              background: '#27272a', 
              color: '#71717a', 
              padding: '0.75rem', 
              borderRadius: '0.5rem', 
              fontWeight: '500',
              cursor: 'not-allowed',
              border: 'none'
            }}
            disabled
          >
            Notify me when available
          </button>
          <p style={{ fontSize: '0.75rem', color: '#52525b', textAlign: 'center', marginTop: '0.75rem' }}>
            Expected: Q2 2026
          </p>
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
            <button onClick={onStartScan} className="primary-cta">Start free analysis</button>
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
      <button onClick={onStartScan} className="primary-cta">Start free analysis</button>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer>
      <div className="footer-content">
        <div className="footer-brand">Twacha Labs</div>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
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
