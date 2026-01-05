'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle2, Scan, Activity, Package } from 'lucide-react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Refs for scroll-triggered animations
  const stepsRef = useRef(null);
  const formRef = useRef(null);
  const isStepsInView = useInView(stepsRef, { once: true, margin: '-100px' });
  const isFormInView = useInView(formRef, { once: true, margin: '-100px' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess(true);
      setEmail('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to join waitlist');
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  const steps = [
    {
      icon: Scan,
      title: 'Clinical Scan',
      description: 'Clip on the macro lens. Our AI scans your pore structure at 15x magnification.',
    },
    {
      icon: Activity,
      title: 'AI Triage',
      description: 'The engine identifies the biological nature of the blemish—Cystic, Pustule, or Nodular.',
    },
    {
      icon: Package,
      title: 'The Protocol',
      description: 'We prescribe the exact hardware kit (Patches or Lancets) to resolve the breach safely.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E3A2F]">
      {/* Sticky Navbar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 w-full bg-[#FDFBF7]/90 backdrop-blur-sm border-b border-stone-200"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight text-[#1E3A2F]">
            TWACHA LABS
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 bg-[#1E3A2F] text-white font-medium rounded-full hover:shadow-md transition-shadow"
          >
            Get Access
          </motion.button>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-24 md:py-32">
          <motion.div
            {...fadeInUp}
            className="text-center mb-24"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 leading-tight tracking-tight text-[#1E3A2F]">
              Precision Triage for
              <br />
              Men's Skin
            </h1>
            <p className="text-lg md:text-xl text-[#52525B] max-w-2xl mx-auto leading-relaxed">
              Clinical-grade analysis powered by advanced imaging technology. 
              Get precise, actionable insights for your skincare routine.
            </p>
          </motion.div>

          {/* How it Works Section */}
          <div ref={stepsRef} className="mb-32">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isStepsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-semibold text-center mb-16 text-[#1E3A2F]"
            >
              How it Works
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={
                      isStepsInView
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: 30 }
                    }
                    transition={{
                      duration: 0.6,
                      delay: index * 0.2,
                      ease: "easeOut",
                    }}
                    className="p-8 bg-white rounded-2xl border border-stone-200 hover:border-stone-300 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#E0E7DF] flex items-center justify-center mb-6">
                      <Icon className="w-7 h-7 text-[#1E3A2F]" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-[#1E3A2F]">
                      Step {index + 1}: {step.title}
                    </h3>
                    <p className="text-[#52525B] leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Email Form Section */}
          <div ref={formRef} className="max-w-lg mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={
                isFormInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
              }
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="p-8 bg-white rounded-2xl border border-stone-200"
            >
              <h2 className="text-2xl md:text-3xl font-semibold text-center mb-4 text-[#1E3A2F]">
                Join the Waitlist
              </h2>
              <p className="text-center text-[#52525B] mb-6">
                Be among the first to experience precision skincare diagnostics.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-5 py-3.5 bg-[#FDFBF7] border border-stone-200 rounded-full focus:outline-none focus:border-[#1E3A2F] focus:ring-1 focus:ring-[#1E3A2F] text-[#1E3A2F] placeholder-[#9CA3AF] transition-all"
                  disabled={loading}
                />
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-8 py-3.5 bg-[#1E3A2F] text-white font-medium rounded-full hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Joining...' : 'Join Waitlist'}
                </motion.button>
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm text-center"
                  >
                    {error}
                  </motion.p>
                )}
                {success && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-green-600 text-sm text-center flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Successfully joined the waitlist!
                  </motion.p>
                )}
              </form>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isFormInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-center mt-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E0E7DF] rounded-full">
                <CheckCircle2 className="w-4 h-4 text-[#1E3A2F]" />
                <span className="text-sm text-[#1E3A2F] font-medium">
                  Trusted by 500+ users
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="w-full px-6 md:px-12 py-12 text-center text-[#52525B] text-sm border-t border-stone-200 bg-white mt-24"
      >
        <p>&copy; {new Date().getFullYear()} Twacha Labs. All rights reserved.</p>
      </motion.footer>
    </div>
  );
}
