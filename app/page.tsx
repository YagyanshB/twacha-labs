'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Image from 'next/image';
import { Scan, ScanFace, Sparkles, Package, Droplet, Shield, Brain, TrendingUp, ArrowRight, CheckCircle2, Star } from 'lucide-react';
import FaceIDScanner from './components/FaceIDScanner';
import EmailGate from './components/EmailGate';
import ResultsDashboard from './components/ResultsDashboard';
import ProductSection from './components/ProductSection';
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
  const [currentEmoji, setCurrentEmoji] = useState('🎯');

  useEffect(() => {
    const emojis = ['🎯', '🔬', '✨', '💪'];
    const interval = setInterval(() => {
      setCurrentEmoji(prev => {
        const currentIndex = emojis.indexOf(prev);
        return emojis[(currentIndex + 1) % emojis.length];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStartScan = () => {
    setFunnelState('scanning');
  };

  const handleScanComplete = async (images: string[]) => {
    setCapturedImages(images);
    setFunnelState('analyzing');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images, email: null }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysisResult(data);
      setFunnelState('email-gate');
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisResult({
        score: 65,
        verdict: 'CAUTION',
        analysis: 'Moderate skin congestion detected. Some areas show inflammation.',
        recommendation: 'The Founder\'s Kit',
      });
      setFunnelState('email-gate');
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
    <div className="min-h-screen bg-white text-[#333333]">
      {/* State 1: Landing/Hero */}
      <AnimatePresence mode="wait">
        {funnelState === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col"
          >
            <Navbar onOpenModal={() => setIsProductModalOpen(true)} />
            <HeroSection onStartScan={handleStartScan} currentEmoji={currentEmoji} />
            <ProductCardsSection />
            <HowItWorksSection />
            <KitSection onOpenModal={() => setIsProductModalOpen(true)} />
            <AIScienceSection />
            <ReviewsSection />
            <FooterCTASection onStartScan={handleStartScan} />
            <Footer />
          </motion.div>
        )}

        {/* State 2: Scanning */}
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

        {/* State 3: Analyzing */}
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

        {/* State 4: Email Gate */}
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

        {/* State 5: Results & Sales */}
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

      {/* Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />
    </div>
  );
}

// Navigation Bar
function Navbar({ onOpenModal }: { onOpenModal: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-white border-b border-[#f0f0f0]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="text-2xl font-black tracking-tight text-[#333333]">
            twacha
          </a>
          <div className="hidden md:flex items-center gap-10">
            <a href="#how" className="text-sm font-medium text-[#333333] hover:opacity-60 transition-opacity">
              How it works
            </a>
            <a href="#science" className="text-sm font-medium text-[#333333] hover:opacity-60 transition-opacity">
              The science
            </a>
            <a href="#kit" className="text-sm font-medium text-[#333333] hover:opacity-60 transition-opacity">
              Shop
            </a>
            <motion.button
              onClick={onOpenModal}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 bg-[#333333] text-white font-medium rounded-full transition-all text-sm"
            >
              Get started
            </motion.button>
          </div>
          <motion.button
            onClick={onOpenModal}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="md:hidden px-4 py-2 bg-[#333333] text-white font-medium rounded-full text-sm"
          >
            Get started
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}

// Hero Section
function HeroSection({ onStartScan, currentEmoji }: { onStartScan: () => void; currentEmoji: string }) {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true });

  const problems = [
    "Breakouts won't quit? 🙄",
    "Texture feels rough? 😤",
    "Dark spots lingering? 😩",
    "Oil out of control? 🤦‍♂️"
  ];

  return (
    <section ref={sectionRef} className="min-h-screen flex items-center pt-24 pb-16 px-6 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          {/* Animated Emoji */}
          <motion.div
            key={currentEmoji}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="text-7xl mb-8 inline-block"
          >
            {currentEmoji}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] text-[#333333] tracking-tight mb-6"
          >
            Your skin is talking.<br />
            Time to listen.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-2xl text-[#666666] mb-2 font-normal"
          >
            No more guesswork. No more wasted products.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg text-[#999999] mb-12"
          >
            Just AI-powered precision for skin that actually improves.
          </motion.p>

          {/* Problem Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex justify-center gap-4 mb-12 flex-wrap"
          >
            {problems.map((problem, idx) => {
              const colors = ['#FF8B7B', '#7BA7E1', '#A8C09A', '#FFB5A7'];
              return (
                <ProblemPill key={idx} text={problem} color={colors[idx]} delay={idx * 0.1} />
              );
            })}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-3"
          >
            <motion.button
              onClick={onStartScan}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-12 py-4 bg-[#333333] text-white font-medium rounded-full hover:shadow-lg transition-all text-lg"
            >
              Take the free skin assessment
            </motion.button>
            <p className="text-sm text-[#999999]">
              2 minutes. Personalized results. Zero spam.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Problem Pill Component
function ProblemPill({ text, color, delay }: { text: string; color: string; delay: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative px-6 py-3 rounded-full text-base font-medium bg-[#fafafa] text-[#333333] border-2 border-transparent transition-all overflow-hidden"
      style={{
        color: hovered ? 'white' : '#333333',
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: color }}
        initial={{ x: '-100%' }}
        animate={{ x: hovered ? '0%' : '-100%' }}
        transition={{ duration: 0.3 }}
      />
      <span className="relative z-10">{text}</span>
    </motion.button>
  );
}

// Product Cards Section
function ProductCardsSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const products = [
    {
      icon: '📸',
      title: 'Scan',
      description: '15x magnification lens reveals what your bathroom mirror won\'t. See your skin\'s real story.',
      color: '#FF8B7B',
    },
    {
      icon: '🧠',
      title: 'Analyze',
      description: 'AI examines 50+ skin parameters in 0.3 seconds. Get insights that usually cost $300 at a derm.',
      color: '#7BA7E1',
    },
    {
      icon: '📦',
      title: 'Treat',
      description: 'Custom kit delivered with exactly what your skin needs. No more, no less. Works or your money back.',
      color: '#A8C09A',
    },
  ];

  return (
    <section ref={sectionRef} className="py-20 px-6 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="group relative bg-[#fafafa] rounded-3xl p-8 md:p-12 text-center cursor-pointer transition-all hover:shadow-xl hover:-translate-y-2 overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                style={{
                  background: `linear-gradient(135deg, ${product.color} 0%, transparent 100%)`,
                }}
              />
              <div className="relative z-10">
                <div className="text-6xl mb-6">{product.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-[#333333]">{product.title}</h3>
                <p className="text-[#666666] leading-relaxed">{product.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const steps = [
    { icon: '📱', title: 'Attach & scan', time: '30 seconds' },
    { icon: '⚡', title: 'Get your analysis', time: 'Instant results' },
    { icon: '🎯', title: 'Receive your kit', time: '2-3 days' },
  ];

  return (
    <section id="how" ref={sectionRef} className="py-20 md:py-32 px-6 md:px-12 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-5 py-2 bg-[#B2E1D4] text-white rounded-full text-sm font-semibold mb-4">
            HOW IT WORKS
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-[#333333]">
            Three steps to skin that cooperates
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-0 relative">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: idx * 0.2, duration: 0.6 }}
              className="text-center p-8 relative group"
            >
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 right-0 w-full h-0.5 bg-[#f0f0f0] transform -translate-y-1/2 translate-x-1/2 z-0" />
              )}
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-[150px] h-[150px] bg-[#fafafa] rounded-3xl mx-auto mb-8 flex items-center justify-center text-6xl transition-all group-hover:bg-[#C8B6E2]"
              >
                {step.icon}
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[#333333]">{step.title}</h3>
              <p className="text-sm text-[#999999]">{step.time}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Kit Section
function KitSection({ onOpenModal }: { onOpenModal: () => void }) {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section id="kit" ref={sectionRef} className="py-20 md:py-32 px-6 md:px-12 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Kit Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <div className="relative w-full max-w-[500px] h-[500px] bg-white rounded-[30px] shadow-xl flex items-center justify-center overflow-hidden">
              <div className="w-4/5 h-4/5 bg-[#FFB5A7] rounded-3xl flex items-center justify-center text-7xl">
                📦
              </div>
            </div>
          </motion.div>

          {/* Kit Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#333333] text-white rounded-full text-sm font-semibold">
              ⚡ LIMITED EDITION
            </span>
            <h2 className="text-5xl font-black text-[#333333]">The Breach Kit</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-[#333333]">£24</span>
              <span className="text-lg text-[#666666]">one-time purchase</span>
            </div>

            <div className="bg-white rounded-3xl p-8">
              <p className="text-base font-semibold mb-4 text-[#666666]">What's inside:</p>
              <ul className="space-y-4">
                {[
                  { name: 'Universal 15x Macro Lens', qty: '1x' },
                  { name: 'Hydrocolloid Patches (Invisible)', qty: '30x' },
                  { name: 'Sterile Extraction Tools', qty: '10x' },
                  { name: 'Prep Pads', qty: '10x' },
                  { name: 'Tactical Carry Case', qty: '1x' },
                ].map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center py-3 border-b border-[#f0f0f0] last:border-0">
                    <span className="font-medium text-[#333333]">{item.name}</span>
                    <span className="text-sm text-[#666666]">{item.qty}</span>
                  </li>
                ))}
              </ul>
            </div>

            <motion.button
              onClick={onOpenModal}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-8 py-4 bg-[#333333] text-white font-medium rounded-full hover:shadow-lg transition-all text-lg"
            >
              Add to cart - £24
            </motion.button>

            <div className="flex gap-6 text-sm text-[#666666]">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Free shipping
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                30-day guarantee
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Discreet packaging
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// AI Science Section
function AIScienceSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const metrics = [
    { value: '50+', label: 'Parameters analyzed' },
    { value: '0.3s', label: 'Analysis time' },
    { value: '94%', label: 'Accuracy rate' },
    { value: '15x', label: 'Magnification' },
  ];

  return (
    <section id="science" ref={sectionRef} className="py-20 md:py-32 px-6 md:px-12 bg-[#333333] text-white">
      <div className="max-w-5xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-black mb-6"
        >
          Powered by skin intelligence
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-xl opacity-90 mb-12"
        >
          Our AI was trained on 100,000+ skin scans. It knows skin better than you know your Netflix password.
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.2 + idx * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="text-5xl font-black text-[#FF8B7B] mb-2">{metric.value}</div>
              <div className="text-sm opacity-80">{metric.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Reviews Section
function ReviewsSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const reviews = [
    {
      initials: 'JM',
      name: 'James M.',
      date: '2 weeks ago',
      text: 'Finally, something that actually tells me what\'s wrong instead of just selling me random stuff. Game changer.',
      color: '#7BA7E1',
    },
    {
      initials: 'AT',
      name: 'Alex T.',
      date: '1 month ago',
      text: 'The AI spotted issues I didn\'t even know I had. Skin\'s never been clearer. Worth every penny.',
      color: '#FF8B7B',
    },
    {
      initials: 'RC',
      name: 'Ryan C.',
      date: '3 weeks ago',
      text: 'Skeptical at first but damn. This thing knows my skin better than I do. Already seeing improvements.',
      color: '#A8C09A',
    },
  ];

  return (
    <section ref={sectionRef} className="py-20 md:py-32 px-6 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-[#333333]">
            Real humans. Real results.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="bg-white border border-[#f0f0f0] rounded-3xl p-8 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: review.color }}
                >
                  {review.initials}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[#333333]">{review.name}</div>
                  <div className="text-sm text-[#999999]">{review.date}</div>
                </div>
              </div>
              <div className="flex gap-1 mb-4 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-[#666666] leading-relaxed">{review.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Footer CTA Section
function FooterCTASection({ onStartScan }: { onStartScan: () => void }) {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className="py-20 md:py-32 px-6 md:px-12 bg-[#FF8B7B] text-white text-center">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Ready to meet your skin?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Join 10,000+ men who've stopped the guessing game.
          </p>
          <motion.button
            onClick={onStartScan}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-12 py-4 bg-white text-[#FF8B7B] font-medium rounded-full hover:shadow-xl transition-all text-lg"
          >
            Start your free assessment
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// Analysis Loading Component
function AnalysisLoading() {
  return (
    <div className="text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-[#FF8B7B] border-t-transparent rounded-full mx-auto mb-6"
      />
      <h2 className="text-2xl font-bold text-[#333333] mb-2">Analyzing Skin Integrity...</h2>
      <p className="text-[#666666]">Processing your scan</p>
    </div>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="w-full px-6 md:px-12 py-12 bg-white border-t border-[#f0f0f0]">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#fafafa] rounded-2xl p-6 mb-8 max-w-4xl mx-auto">
          <p className="text-xs text-[#666666] leading-relaxed text-center">
            <strong className="text-[#333333]">Medical disclaimer:</strong> Twacha is designed for cosmetic skin analysis only. Not a medical device. Not intended to diagnose, treat, cure, or prevent any disease. Consult a dermatologist for medical concerns.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <h3 className="text-xl font-black text-[#333333]">twacha</h3>
            <p className="text-sm text-[#666666] leading-relaxed max-w-xs">
              AI-powered skin analysis that actually works. No BS. No spam. Just better skin.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 text-[#333333]">Product</h4>
            <ul className="space-y-3">
              {['How it works', 'The science', 'Reviews', 'FAQ'].map((link, idx) => (
                <li key={idx}>
                  <a href="#" className="text-sm text-[#666666] hover:text-[#333333] transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 text-[#333333]">Company</h4>
            <ul className="space-y-3">
              {['About', 'Blog', 'Careers', 'Press'].map((link, idx) => (
                <li key={idx}>
                  <a href="#" className="text-sm text-[#666666] hover:text-[#333333] transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 text-[#333333]">Support</h4>
            <ul className="space-y-3">
              {['Help center', 'Contact', 'Shipping', 'Returns'].map((link, idx) => (
                <li key={idx}>
                  <a href="#" className="text-sm text-[#666666] hover:text-[#333333] transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#f0f0f0] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#666666]">© 2026 Twacha Labs. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-[#666666] hover:text-[#333333] transition-colors">
              Privacy policy
            </a>
            <a href="#" className="text-sm text-[#666666] hover:text-[#333333] transition-colors">
              Terms of service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
