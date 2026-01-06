'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Camera, Scissors, Bandage } from 'lucide-react';

interface AnalysisResult {
  score: number;
  verdict: string;
  analysis: string;
  recommendation: string;
}

interface ResultsDashboardProps {
  analysisResult: AnalysisResult;
  email: string;
}

export default function ResultsDashboard({ analysisResult, email }: ResultsDashboardProps) {
  const getColor = () => {
    if (analysisResult.score >= 80) return '#10B981'; // Green
    if (analysisResult.score >= 50) return '#F59E0B'; // Yellow/Orange
    return '#EF4444'; // Red
  };

  const getStatus = () => {
    if (analysisResult.score >= 80) return 'Skin Barrier Intact';
    return 'ACTIVE BREACH DETECTED';
  };

  const getStatusColor = () => {
    if (analysisResult.score >= 80) return 'bg-green-100 text-green-800';
    return 'bg-red-100 text-red-800';
  };

  const hardwareItems = [
    { icon: Camera, name: 'Macro Lens', description: '15x magnification' },
    { icon: Scissors, name: 'Sterile Lancets', description: 'Precision extraction' },
    { icon: Bandage, name: 'Hydrocolloid Patches', description: 'Healing support' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#1E293B] mb-2">Your Skin Analysis</h1>
          <p className="text-[#52525B]">Results for {email}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-stone-200 shadow-xl p-8"
          >
            <h2 className="text-xl font-semibold text-[#1E293B] mb-6 text-center">
              Skin Integrity Score
            </h2>
            
            {/* Radial Progress Bar */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-64 h-64">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="12"
                  />
                  <motion.circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke={getColor()}
                    strokeWidth="12"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: analysisResult.score / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="text-5xl font-bold text-[#1E293B]"
                  >
                    {analysisResult.score}
                  </motion.span>
                  <span className="text-sm text-[#52525B] mt-1">/ 100</span>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor()}`}>
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium text-sm">{getStatus()}</span>
              </div>
            </div>
          </motion.div>

          {/* Verdict & Analysis Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl border border-stone-200 shadow-xl p-8"
          >
            <div className="mb-6">
              <p className="text-sm font-medium text-[#52525B] mb-2">Status</p>
              <div className={`inline-block px-4 py-2 rounded-full ${getStatusColor()} mb-4`}>
                <span className="font-semibold">{analysisResult.verdict}</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-[#52525B] mb-2">Analysis</p>
              <p className="text-[#1E293B] leading-relaxed">{analysisResult.analysis}</p>
            </div>

            <div className="p-4 bg-[#3B82F6]/10 rounded-xl border border-[#3B82F6]/20">
              <p className="text-sm font-medium text-[#3B82F6] mb-2">Recommended Protocol</p>
              <p className="text-lg font-semibold text-[#1E293B]">{analysisResult.recommendation}</p>
            </div>
          </motion.div>
        </div>

        {/* Hardware Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl border border-stone-200 shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-semibold text-[#1E293B] mb-6">The Founder's Kit</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {hardwareItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="text-center p-6 bg-[#FDFBF7] rounded-2xl border border-stone-200">
                  <div className="w-16 h-16 bg-[#3B82F6]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-[#3B82F6]" />
                  </div>
                  <h3 className="font-semibold text-[#1E293B] mb-2">{item.name}</h3>
                  <p className="text-sm text-[#52525B]">{item.description}</p>
                </div>
              );
            })}
          </div>

          {/* Checkout Section */}
          <div className="border-t border-stone-200 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl font-bold text-[#1E293B]">£24.00</span>
                  <span className="text-xl text-[#52525B] line-through">£40.00</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#10B981]/10 text-[#10B981] text-xs font-semibold rounded-full">
                    Ships Feb 10th
                  </span>
                  <span className="text-sm text-[#52525B]">Only 50 units</span>
                </div>
              </div>
              <motion.a
                href="https://stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-[#3B82F6] text-white font-medium rounded-full hover:bg-[#2563EB] hover:shadow-xl transition-all"
              >
                SECURE YOUR KIT
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
