'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Camera, Scissors, Bandage, AlertTriangle, CheckCircle } from 'lucide-react';

interface AnalysisResult {
  score: number;
  verdict: string;
  analysis: string;
  recommendation: string;
  imagePath?: string | null;
  gagsScore?: number;
  lesionType?: string;
  extractionEligible?: string; // "YES" or "NO"
  activeIngredients?: string[];
  aiConfidence?: number;
  createdAt?: string;
}

interface ResultsDashboardProps {
  analysisResult: AnalysisResult;
  email: string;
}

export default function ResultsDashboard({ analysisResult, email }: ResultsDashboardProps) {
  // Format date professionally
  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  const isExtractionEligible = analysisResult.extractionEligible === 'YES';

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
          <h1 className="text-3xl font-semibold text-[#1E293B] mb-2">Clinical Analysis Report</h1>
          <p className="text-[#52525B]">Results for {email || 'Patient'}</p>
          {analysisResult.createdAt && (
            <p className="text-sm text-[#52525B] font-mono mt-1">
              Analysis Date: {formatDate(analysisResult.createdAt)}
            </p>
          )}
        </div>

        {/* Uploaded Image Display */}
        {analysisResult.imagePath && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-white rounded-3xl border border-stone-200 shadow-xl p-6"
          >
            <h2 className="text-xl font-semibold text-[#1E293B] mb-4">Scan Image</h2>
            <div className="relative rounded-xl overflow-hidden border border-stone-200">
              <img 
                src={analysisResult.imagePath} 
                alt="Skin scan" 
                className="w-full h-auto"
                onError={(e) => {
                  console.error('Failed to load image:', analysisResult.imagePath);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <p className="text-xs text-[#52525B] mt-2 font-mono">
              Image URL: {analysisResult.imagePath.substring(0, 60)}...
            </p>
          </motion.div>
        )}

        {/* GAGS Score and Extraction Eligibility */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* GAGS Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-stone-200 shadow-xl p-8"
          >
            <h2 className="text-xl font-semibold text-[#1E293B] mb-6 text-center">
              GAGS Score
            </h2>
            
            {/* GAGS Score Display in Monospace */}
            <div className="flex items-center justify-center mb-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-[#1E293B] font-mono mb-2">
                  {analysisResult.gagsScore || 'N/A'}
                </div>
                <div className="text-sm text-[#52525B] font-mono">/ 4</div>
                {analysisResult.lesionType && (
                  <div className="mt-4 text-sm text-[#52525B]">
                    Lesion Type: <span className="font-semibold">{analysisResult.lesionType}</span>
                  </div>
                )}
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

          {/* Extraction Eligibility Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl border border-stone-200 shadow-xl p-8"
          >
            <h2 className="text-xl font-semibold text-[#1E293B] mb-6 text-center">
              Extraction Eligibility
            </h2>
            
            <div className="flex flex-col items-center justify-center mb-6 min-h-[200px]">
              {isExtractionEligible ? (
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    Eligible for Precision Protocol
                  </div>
                  <p className="text-sm text-[#52525B]">
                    Surface-level lesions detected. Safe for extraction.
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-12 h-12 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-red-600 mb-2">
                    Non-Intervention Area
                  </div>
                  <p className="text-sm text-[#52525B]">
                    Deep lesions or inflammation detected. Professional consultation recommended.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Clinical Report Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-stone-200 shadow-xl p-8 mb-8"
        >
          <div className="mb-6">
            <p className="text-sm font-medium text-[#52525B] mb-2">Triage Level</p>
            <div className={`inline-block px-4 py-2 rounded-full ${getStatusColor()} mb-4`}>
              <span className="font-semibold">{analysisResult.verdict}</span>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium text-[#52525B] mb-2">Clinical Report</p>
            <p className="text-[#1E293B] leading-relaxed whitespace-pre-wrap">{analysisResult.analysis}</p>
          </div>

          {/* Active Ingredients */}
          {analysisResult.activeIngredients && analysisResult.activeIngredients.length > 0 && (
            <div className="mb-6 p-4 bg-[#3B82F6]/10 rounded-xl border border-[#3B82F6]/20">
              <p className="text-sm font-medium text-[#3B82F6] mb-2">Recommended Active Ingredients</p>
              <div className="flex flex-wrap gap-2">
                {analysisResult.activeIngredients.map((ingredient, index) => (
                  <span key={index} className="px-3 py-1 bg-white rounded-full text-sm font-semibold text-[#1E293B]">
                  {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 bg-[#3B82F6]/10 rounded-xl border border-[#3B82F6]/20">
            <p className="text-sm font-medium text-[#3B82F6] mb-2">Recommended Protocol</p>
            <p className="text-lg font-semibold text-[#1E293B]">{analysisResult.recommendation}</p>
          </div>

          {/* AI Confidence */}
          {analysisResult.aiConfidence !== undefined && (
            <div className="mt-4 text-xs text-[#52525B] font-mono">
              AI Confidence: {(analysisResult.aiConfidence * 100).toFixed(1)}%
            </div>
          )}
        </motion.div>

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
