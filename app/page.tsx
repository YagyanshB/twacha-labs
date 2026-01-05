'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Microscope, Shield, Zap } from 'lucide-react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const features = [
    {
      icon: Microscope,
      title: '15x Macro Vision',
      description: 'Precision diagnostics at the cellular level',
    },
    {
      icon: Shield,
      title: 'AI Protocol',
      description: 'Intelligent analysis for optimal results',
    },
    {
      icon: Zap,
      title: 'Sterile Hardware',
      description: 'Medical-grade equipment for your routine',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full px-6 md:px-12 py-6 flex items-center justify-between relative z-10"
      >
        <div className="text-2xl font-bold tracking-wider text-[#39FF14]">
          TWACHA LABS
        </div>
        <div className="px-4 py-1.5 bg-[#39FF14] text-black text-xs font-semibold tracking-wider rounded-sm">
          BETA
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-32">
          <motion.div
            {...fadeInUp}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              Don't just wash.
              <br />
              <span className="text-[#39FF14]">Diagnose.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
              The first tactical triage system for male skincare.
            </p>
          </motion.div>

          {/* Email Form */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="max-w-md mx-auto mb-24"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-6 py-4 bg-black border-2 border-gray-800 rounded-lg focus:outline-none focus:border-[#39FF14] text-white placeholder-gray-500 transition-colors"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-[#39FF14] text-black font-semibold rounded-lg hover:bg-[#32E60F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {loading ? 'Joining...' : 'Join Waitlist'}
                </button>
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm text-center"
                >
                  {error}
                </motion.p>
              )}
              {success && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[#39FF14] text-sm text-center"
                >
                  Successfully joined the waitlist!
                </motion.p>
              )}
            </form>
          </motion.div>

          {/* Features */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-lg border-2 border-[#39FF14] bg-black/50">
                    <Icon className="w-8 h-8 text-[#39FF14]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-[#39FF14]">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="w-full px-6 md:px-12 py-8 text-center text-gray-500 text-sm relative z-10"
      >
        <p>&copy; {new Date().getFullYear()} Twacha Labs. All rights reserved.</p>
      </motion.footer>
    </div>
  );
}
