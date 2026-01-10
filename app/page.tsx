'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FaceIDScanner from './components/FaceIDScanner';
import EmailGate from './components/EmailGate';
import ResultsDashboard from './components/ResultsDashboard';
import ProductModal from './components/ProductModal';
import SkinAnalysisFlow from './components/SkinAnalysisFlow';

type FunnelState = 'landing' | 'analysis-flow' | 'scanning' | 'analyzing' | 'email-gate' | 'results';

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
    // Start with the new analysis flow
    setFunnelState('analysis-flow');
  };

  const handleAnalysisFlowComplete = (data: { photo: string; skinType: string; age: string }) => {
    setUserData(data);
    // Photo is always captured in the flow, proceed directly to analysis
    if (data.photo) {
      setCapturedImages([data.photo]);
      handleAnalysis([data.photo]);
    } else {
      // Fallback: if no photo somehow, go to scanning
      setFunnelState('scanning');
    }
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
        {funnelState === 'analysis-flow' && (
          <motion.div
            key="analysis-flow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SkinAnalysisFlow
              onComplete={handleAnalysisFlowComplete}
              onBack={() => setFunnelState('landing')}
            />
          </motion.div>
        )}

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
            <li><a href="#report" onClick={(e) => { e.preventDefault(); document.getElementById('report')?.scrollIntoView({ behavior: 'smooth' }); }}>Sample report</a></li>
          </ul>
          <button onClick={onStartScan} className="scan-button">Start scanning</button>
        </div>
      </div>
    </nav>
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
          <button onClick={onStartScan} className="primary-cta" style={{ background: 'white', color: 'black' }}>Get started</button>
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

// Product Section
function ProductSection({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <section className="product-section">
      <div className="product-container">
        <div className="product-content">
          <h2>The complete kit</h2>
          <p>Everything you need for professional skin analysis at home</p>
          
          <div className="product-features">
            <div className="product-feature">
              <h4>AI Camera Module</h4>
              <p>Medical-grade imaging technology designed for accurate skin analysis</p>
            </div>
            <div className="product-feature">
              <h4>Smart Analysis</h4>
              <p>Instant results with personalised recommendations tailored to your skin</p>
            </div>
            <div className="product-feature">
              <h4>Progress Tracking</h4>
              <p>Monitor improvements over time with detailed insights and trends</p>
            </div>
          </div>

          <div className="product-price">
            <span className="price">£49</span>
            <span className="price-note">One-time purchase • Free shipping</span>
          </div>

          <button onClick={onOpenModal} className="primary-cta">Pre-order now</button>
        </div>
        
        <div className="product-visual">
          <div className="product-image-container">
            <img 
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPCEtLSBCYWNrZ3JvdW5kIGdyYWRpZW50IC0tPgogIDxkZWZzPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJiZ0dyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzFhMWExYTtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMDAwMDAwO3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICAgIAogICAgPCEtLSBTaGFkb3cgZmlsdGVyIC0tPgogICAgPGZpbHRlciBpZD0ic2hhZG93IiB4PSItNTAlIiB5PSItNTAlIiB3aWR0aD0iMjAwJSIgaGVpZ2h0PSIyMDAlIj4KICAgICAgPGZlR2F1c3NpYW5CbHVyIGluPSJTb3VyY2VBbHBoYSIgc3RkRGV2aWF0aW9uPSI1Ii8+CiAgICAgIDxmZU9mZnNldCBkeD0iMCIgZHk9IjEwIiByZXN1bHQ9Im9mZnNldGJsdXIiLz4KICAgICAgPGZlRmxvb2QgZmxvb2QtY29sb3I9IiMwMDAwMDAiIGZsb29kLW9wYWNpdHk9IjAuMyIvPgogICAgICA8ZmVDb21wb3NpdGUgaW4yPSJvZmZzZXRibHVyIiBvcGVyYXRvcj0iaW4iLz4KICAgICAgPGZlTWVyZ2U+CiAgICAgICAgPGZlTWVyZ2VOb2RlLz4KICAgICAgICA8ZmVNZXJnZU5vZGUgaW49IlNvdXJjZUdyYXBoaWMiLz4KICAgICAgPC9mZU1lcmdlPgogICAgPC9maWx0ZXI+CiAgPC9kZWZzPgoKICA8IS0tIE1haW4gY2FzZSAtLT4KICA8cmVjdCB4PSIxMDAiIHk9IjE1MCIgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMDAiIHJ4PSIyMCIgZmlsbD0idXJsKCNiZ0dyYWRpZW50KSIgZmlsdGVyPSJ1cmwoI3NoYWRvdykiLz4KICAKICA8IS0tIENhc2UgbGlkIChvcGVuKSAtLT4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMDAsIDEyMCkgcm90YXRlKC0xNSAyMDAgMCkiPgogICAgPHJlY3QgeD0iMCIgeT0iLTE1MCIgd2lkdGg9IjQwMCIgaGVpZ2h0PSIxNTAiIHJ4PSIyMCIgZmlsbD0idXJsKCNiZ0dyYWRpZW50KSIvPgogICAgPCEtLSBFbWJvc3NlZCBsb2dvIG9uIGxpZCAtLT4KICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE4MCwgLTEwMCkiIG9wYWNpdHk9IjAuMyI+CiAgICAgIDxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjQiIGZpbGw9IiNmZmYiLz4KICAgICAgPGNpcmNsZSBjeD0iMjAiIGN5PSI4IiByPSIzIiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIwLjgiLz4KICAgICAgPGNpcmNsZSBjeD0iMzIiIGN5PSIyMCIgcj0iMyIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iMC44Ii8+CiAgICAgIDxjaXJjbGUgY3g9IjIwIiBjeT0iMzIiIHI9IjMiIGZpbGw9IiNmZmYiIG9wYWNpdHk9IjAuOCIvPgogICAgICA8Y2lyY2xlIGN4PSI4IiBjeT0iMjAiIHI9IjMiIGZpbGw9IiNmZmYiIG9wYWNpdHk9IjAuOCIvPgogICAgPC9nPgogICAgPCEtLSBCcmFuZCB0ZXh0IC0tPgogICAgPHRleHQgeD0iMjAwIiB5PSItNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZm9udC13ZWlnaHQ9IjMwMCIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iMC41IiBsZXR0ZXItc3BhY2luZz0iNCI+VFdBQ0hBIExBQlM8L3RleHQ+CiAgPC9nPgogIAogIDwhLS0gSW50ZXJpb3IgY29tcGFydG1lbnRzIC0tPgogIDxyZWN0IHg9IjEyMCIgeT0iMTcwIiB3aWR0aD0iMzYwIiBoZWlnaHQ9IjE2MCIgZmlsbD0iIzBhMGEwYSIgcng9IjEwIi8+CiAgCiAgPCEtLSBDYW1lcmEgbW9kdWxlIC0tPgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE4MCwgMjMwKSI+CiAgICA8IS0tIExlbnMgaG91c2luZyAtLT4KICAgIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSI0MCIgZmlsbD0iIzFhMWExYSIvPgogICAgPGNpcmNsZSBjeD0iMCIgY3k9IjAiIHI9IjM1IiBmaWxsPSIjMDAwIi8+CiAgICA8IS0tIEJsdWUgYWNjZW50IHJpbmcgLS0+CiAgICA8Y2lyY2xlIGN4PSIwIiBjeT0iMCIgcj0iMzAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwNjZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBvcGFjaXR5PSIwLjgiLz4KICAgIDwhLS0gSW5uZXIgbGVucyAtLT4KICAgIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyNSIgZmlsbD0iIzBhMGEwYSIvPgogICAgPCEtLSBMZW5zIHJlZmxlY3Rpb24gLS0+CiAgICA8ZWxsaXBzZSBjeD0iLTEwIiBjeT0iLTEwIiByeD0iOCIgcnk9IjEyIiBmaWxsPSIjZmZmZmZmIiBvcGFjaXR5PSIwLjEiLz4KICA8L2c+CiAgCiAgPCEtLSBUZXh0IGxhYmVscyBpbiBjYXNlIC0tPgogIDx0ZXh0IHg9IjMwMCIgeT0iMjIwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNmZmYiIG9wYWNpdHk9IjAuNSI+QUkgQ0FNRVJBIE1PRFVMRTI8L3RleHQ+CiAgPHRleHQgeD0iMzAwIiB5PSIyNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMSIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iMC4zIj5NZWRpY2FsLWdyYWRlIGltYWdpbmc8L3RleHQ+CiAgCiAgPHRleHQgeD0iMzAwIiB5PSIyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iMC41Ij5JTlNUQU5UIEFOQUxZU0lTPC90ZXh0PgogIDx0ZXh0IHg9IjMwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiNmZmYiIG9wYWNpdHk9IjAuMyI+MzAtc2Vjb25kIHJlc3VsdHM8L3RleHQ+CiAgCiAgPCEtLSBTdWJ0bGUgZ3JpZCBwYXR0ZXJuIG9uIGludGVyaW9yIC0tPgogIDxnIG9wYWNpdHk9IjAuMDUiPgogICAgPGxpbmUgeDE9IjI1MCIgeTE9IjE3MCIgeDI9IjI1MCIgeTI9IjMzMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuNSIvPgogICAgPGxpbmUgeDE9IjM3MCIgeTE9IjE3MCIgeDI9IjM3MCIgeTI9IjMzMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuNSIvPgogICAgPGxpbmUgeDE9IjEyMCIgeTE9IjI1MCIgeDI9IjQ4MCIgeTI9IjI1MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuNSIvPgogIDwvZz4KPC9zdmc+" 
              alt="Twacha Labs Kit" 
              className="product-image"
            />
            <div className="product-glow"></div>
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
            <button onClick={onStartScan} className="primary-cta">Get your analysis</button>
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
      <button onClick={onStartScan} className="primary-cta">Start your scan</button>
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
