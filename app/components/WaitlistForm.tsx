'use client';

import { useState } from 'react';
import { Mail, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface WaitlistFormProps {
  onSubmit: (email: string, consentGiven: boolean) => void;
  variant?: 'hero' | 'footer';
}

export default function WaitlistForm({ onSubmit, variant = 'hero' }: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!consentGiven) {
      setError('Please consent to biometric data processing');
      return;
    }

    setLoading(true);
    onSubmit(email, consentGiven);
  };

  if (variant === 'footer') {
    // Minimal footer version
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-slate-900 placeholder-slate-400 text-sm font-sans transition-all"
            disabled={loading}
          />
        </div>
        <label className="flex items-start gap-2 cursor-pointer group">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="sr-only"
              required
            />
            <div className={`w-4 h-4 border border-slate-300 rounded flex items-center justify-center transition-all ${
              consentGiven ? 'bg-slate-900 border-slate-900' : 'bg-white group-hover:border-slate-400'
            }`}>
              {consentGiven && <Check className="w-3 h-3 text-white" />}
            </div>
          </div>
          <div className="flex-1">
            <span className="text-xs text-slate-600 font-sans">
              I consent to biometric processing for my analysis.{' '}
              <a href="/privacy" className="underline hover:text-slate-900">How we protect your data</a>
            </span>
          </div>
        </label>
        {error && (
          <p className="text-red-500 text-xs font-sans">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading || !consentGiven}
          className="w-full px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-sans"
        >
          {loading ? 'Joining...' : 'Reserve My Kit'}
        </button>
      </form>
    );
  }

  // Hero version - larger, more prominent
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-md mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 text-slate-900 placeholder-slate-400 text-base font-sans transition-all"
            disabled={loading}
          />
        </div>
        {error && (
          <p className="text-red-500 text-sm text-center font-sans">{error}</p>
        )}
        <motion.button
          type="submit"
          disabled={loading || !consentGiven}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-8 py-3.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base font-sans"
        >
          <Mail className="w-5 h-5" />
          {loading ? 'Joining...' : 'Reserve My Kit'}
        </motion.button>
        <label className="flex items-start gap-2 cursor-pointer group">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="sr-only"
              required
            />
            <div className={`w-4 h-4 border border-slate-300 rounded flex items-center justify-center transition-all ${
              consentGiven ? 'bg-slate-900 border-slate-900' : 'bg-white group-hover:border-slate-400'
            }`}>
              {consentGiven && <Check className="w-3 h-3 text-white" />}
            </div>
          </div>
          <div className="flex-1">
            <span className="text-xs text-slate-600 font-sans">
              I consent to biometric processing for my analysis.{' '}
              <a href="/privacy" className="underline hover:text-slate-900">How we protect your data</a>
            </span>
          </div>
        </label>
      </form>
    </motion.div>
  );
}
