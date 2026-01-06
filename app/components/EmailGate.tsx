'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';

interface AnalysisResult {
  score: number;
  verdict: string;
  analysis: string;
  recommendation: string;
}

interface EmailGateProps {
  analysisResult: AnalysisResult;
  onSubmit: (email: string) => void;
}

export default function EmailGate({ analysisResult, onSubmit }: EmailGateProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    onSubmit(email);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Blurred Results Preview */}
        <div className="relative mb-8">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xl p-8 blur-sm pointer-events-none">
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="12"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="12"
                    strokeDasharray={`${(analysisResult.score / 100) * 565} 565`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-[#1E293B]">{analysisResult.score}</span>
                  <span className="text-sm text-[#52525B]">/ 100</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-[#1E293B] mb-2">Skin Integrity Score</p>
              <p className="text-sm text-[#52525B]">{analysisResult.verdict}</p>
            </div>
          </div>

          {/* Lock Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-stone-200 shadow-2xl p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#3B82F6]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-[#3B82F6]" />
                </div>
                <h2 className="text-2xl font-semibold text-[#1E293B] mb-2">
                  Analysis Complete
                </h2>
                <p className="text-[#52525B]">
                  Enter your email to view your Skin Integrity Score
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full px-5 py-3.5 bg-[#FDFBF7] border border-stone-200 rounded-full focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 text-[#1E293B] placeholder-[#9CA3AF] transition-all"
                    disabled={loading}
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-8 py-3.5 bg-[#3B82F6] text-white font-medium rounded-full hover:bg-[#2563EB] hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  {loading ? 'Unlocking...' : 'View Results'}
                </motion.button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
