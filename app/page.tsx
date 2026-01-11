'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle2 } from 'lucide-react';
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
      
      const mappedResult: AnalysisResult = {
        score: Math.round((data.confidence || 0.7) * 100),
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
    const allImages = userData?.photo ? [userData.photo, ...images] : images;
    handleAnalysis(allImages);
  };

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
      {/* System Status Indicator */}
      <SystemStatusIndicator />
      
      <AnimatePresence mode="wait">
        {funnelState === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Navbar onStartScan={handleStartScan} />
            <HeroComparisonSection onStartScan={handleStartScan} />
            <ClinicalLogicSection />
            <BenefitsSection />
            <BetaPilotCTASection />
            <FounderSection />
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

// System Status Indicator
function SystemStatusIndicator() {
  return (
    <div className="system-status">
      <div className="system-status-item">
        <span className="status-label">SYSTEM:</span>
        <span className="status-value operational">OPERATIONAL</span>
      </div>
      <div className="system-status-item">
        <span className="status-label">MODEL:</span>
        <span className="status-value">GEMINI 1.5 FLASH</span>
      </div>
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
            <li><a href="#methodology" onClick={(e) => { e.preventDefault(); document.getElementById('methodology')?.scrollIntoView({ behavior: 'smooth' }); }}>Methodology</a></li>
            <li><a href="/pricing" onClick={(e) => { e.preventDefault(); window.location.href = '/pricing'; }}>Pricing</a></li>
          </ul>
          <button onClick={onStartScan} className="scan-button">Start free</button>
        </div>
      </div>
    </nav>
  );
}

// Hero Comparison Section
function HeroComparisonSection({ onStartScan }: { onStartScan: () => void }) {
  return (
    <section className="hero-comparison">
      <div className="hero-comparison-container">
        <div className="hero-header">
          <h1>Precision Dermal Analysis for Men.</h1>
          <p className="hero-subheadline">Stop guessing. Use clinical-grade computer vision and 15x macro-imaging to optimize your skin health. Built by AI engineers with NHS experience.</p>
        </div>
        
        <div className="comparison-grid">
          <div className="comparison-item">
            <div className="comparison-label">Standard 1x View</div>
            <div className="comparison-image standard-view">
              <div className="image-placeholder">
                <svg viewBox="0 0 400 400" fill="none">
                  <rect width="400" height="400" fill="#f3f4f6"/>
                  <circle cx="200" cy="200" r="80" fill="#d1d5db" opacity="0.5"/>
                  <text x="200" y="200" textAnchor="middle" fill="#9ca3af" fontSize="16" fontFamily="system-ui">Standard Selfie</text>
                </svg>
              </div>
              <div className="blur-overlay"></div>
            </div>
          </div>
          
          <div className="comparison-item">
            <div className="comparison-label">Twacha 15x Precision View</div>
            <div className="comparison-image macro-view">
              <div className="image-placeholder">
                <svg viewBox="0 0 400 400" fill="none">
                  <rect width="400" height="400" fill="#1f2937"/>
                  <rect x="150" y="150" width="100" height="100" fill="#374151" stroke="#10b981" strokeWidth="2"/>
                  <circle cx="200" cy="200" r="30" fill="#4b5563"/>
                  <circle cx="200" cy="200" r="15" fill="#6b7280"/>
                  <text x="200" y="250" textAnchor="middle" fill="#10b981" fontSize="12" fontFamily="monospace">15x MACRO</text>
                </svg>
              </div>
              <div className="bounding-box"></div>
            </div>
          </div>
        </div>
        
        <div className="hero-cta">
          <button onClick={onStartScan} className="primary-cta">Start free analysis</button>
        </div>
      </div>
    </section>
  );
}

// Clinical Logic Section
function ClinicalLogicSection() {
  return (
    <section className="clinical-logic" id="methodology">
      <div className="clinical-logic-container">
        <h2 className="section-title">Clinical Methodology</h2>
        
        <div className="clinical-columns">
          <div className="clinical-column">
            <div className="column-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
            </div>
            <h3>GAGS Scoring</h3>
            <p>We use the Global Acne Grading System to provide mathematical evidence of healing progress. Track your GAGS score over time with clinical precision.</p>
            <div className="clinical-stat">
              <span className="stat-label">Score Range:</span>
              <span className="stat-value">0-44</span>
            </div>
          </div>
          
          <div className="clinical-column">
            <div className="column-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h3>Ingredient Triage</h3>
            <p>AI-driven cross-referencing of active ingredients against your specific dermal profile. Personalized recommendations based on clinical research.</p>
            <div className="clinical-stat">
              <span className="stat-label">Active Ingredients:</span>
              <span className="stat-value">6+</span>
            </div>
          </div>
          
          <div className="clinical-column">
            <div className="column-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
              </svg>
            </div>
            <h3>NHS Referral Ready</h3>
            <p>Generate high-resolution clinical reports ready for GP consultations if severe markers are detected. Export PDF reports with GAGS scores and lesion mapping.</p>
            <div className="clinical-stat">
              <span className="stat-label">Report Format:</span>
              <span className="stat-value">PDF</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Benefits Section (Updated)
function BenefitsSection() {
  return (
    <section className="benefits">
      <div className="benefits-container">
        <h2>Built for Clinical Precision</h2>
        <div className="benefit-cards">
          <div className="benefit-card">
            <div className="benefit-number">01</div>
            <h3>15x Macro Imaging</h3>
            <p>Clinical-grade magnification reveals what standard cameras miss. See pore structure, texture, and early markers with precision.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-number">02</div>
            <h3>AI-Powered Analysis</h3>
            <p>Google Gemini 1.5 Flash processes your images with clinical knowledge base integration. Real-time GAGS scoring and lesion differentiation.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-number">03</div>
            <h3>Progress Tracking</h3>
            <p>Mathematical evidence of healing. Track GAGS scores, extraction eligibility, and triage levels over time with clinical accuracy.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Beta Pilot CTA Section
function BetaPilotCTASection() {
  return (
    <section className="beta-pilot-cta">
      <div className="beta-pilot-container">
        <h2>Apply for Beta Pilot</h2>
        <p className="beta-date">Batch 001: Launching Feb 14, 2026</p>
        <p className="beta-description">50 kits remaining for UK residents. Clinical-grade hardware and AI analysis for early adopters.</p>
        
        <div className="beta-cta-wrapper">
          <button 
            onClick={() => window.location.href = '/analysis'}
            className="beta-pilot-button"
          >
            Apply for Beta Pilot (Feb 14)
          </button>
          
          <div className="beta-info">
            <p className="beta-remaining">Batch 001: 50 Kits remaining for UK residents.</p>
            
            <div className="privacy-badge">
              <Lock className="lock-icon" size={14} />
              <span>Clinical-grade encryption. Your biometric data is never sold.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Founder Section
function FounderSection() {
  return (
    <section className="founder-section">
      <div className="founder-container">
        <div className="founder-content">
          <div className="founder-header">
            <h2>Founder's Note</h2>
          </div>
          
          <div className="founder-bio">
            <div className="founder-name">
              <h3>Yagyansh Bagri</h3>
              <p className="founder-title">AI Engineer & Founder</p>
            </div>
            
            <div className="founder-details">
              <p>
                Formerly at NHS Trusts & University of Nottingham. Building the Strava for Skin.
              </p>
              <p className="founder-achievement">
                Completed £500k English Channel Swim — demonstrating the same grit and high-agency we bring to clinical AI development.
              </p>
            </div>
          </div>
        </div>
      </div>
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
