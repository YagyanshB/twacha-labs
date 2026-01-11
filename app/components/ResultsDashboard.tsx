'use client';

import { motion } from 'framer-motion';
import { Camera, Scissors, Bandage } from 'lucide-react';

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
  const isExtractionEligible = analysisResult.extractionEligible === 'YES';

  // Get Dermal Status with colored dot
  const getDermalStatus = () => {
    const triage = analysisResult.verdict;
    if (triage === 'Routine') {
      return { text: 'Stable', color: 'bg-green-500', dotColor: 'text-green-500' };
    } else if (triage === 'Monitor') {
      return { text: 'Observation Required', color: 'bg-amber-500', dotColor: 'text-amber-500' };
    } else {
      return { text: 'Professional Care Required', color: 'bg-red-500', dotColor: 'text-red-500' };
    }
  };

  const dermalStatus = getDermalStatus();

  // Parse analysis summary into three bullet points
  const parseSummary = (summary: string) => {
    // Try to extract structured information from the summary
    const lines = summary.split(/[\.\n]/).filter(line => line.trim().length > 10);
    
    // Simple parsing: look for key phrases
    let whatWeSee = '';
    let whyItsHappening = '';
    let immediateStep = '';

    // Try to find "What we see" type information
    const whatPatterns = [
      /(?:see|detect|observe|identify|found|showing|present)[^\.]{10,60}/i,
      /(?:lesion|acne|pustule|nodule|comedone|inflammation|congestion)[^\.]{10,60}/i,
    ];
    
    const whyPatterns = [
      /(?:cause|due to|because|result of|caused by|attributed to)[^\.]{10,60}/i,
      /(?:blocked|clogged|inflammation|bacterial|excess)[^\.]{10,60}/i,
    ];
    
    const stepPatterns = [
      /(?:recommend|suggest|apply|use|try|consider|step|action)[^\.]{10,60}/i,
      /(?:warm compress|cleanser|topical|extraction|consultation)[^\.]{10,60}/i,
    ];

    // Extract first matching sentence for each category
    for (const line of lines) {
      if (!whatWeSee && whatPatterns.some(p => p.test(line))) {
        whatWeSee = line.trim().substring(0, 80);
      }
      if (!whyItsHappening && whyPatterns.some(p => p.test(line))) {
        whyItsHappening = line.trim().substring(0, 80);
      }
      if (!immediateStep && stepPatterns.some(p => p.test(line))) {
        immediateStep = line.trim().substring(0, 80);
      }
    }

    // Fallback: use first three sentences if parsing fails
    if (!whatWeSee || !whyItsHappening || !immediateStep) {
      const sentences = lines.slice(0, 3);
      whatWeSee = sentences[0]?.trim().substring(0, 80) || 'Surface-level skin condition detected';
      whyItsHappening = sentences[1]?.trim().substring(0, 80) || 'Blocked pores and excess sebum production';
      immediateStep = sentences[2]?.trim().substring(0, 80) || 'Apply a warm compress to the affected area';
    }

    return { whatWeSee, whyItsHappening, immediateStep };
  };

  const summary = parseSummary(analysisResult.analysis);

  // Generate Scan ID from timestamp
  const scanId = analysisResult.createdAt 
    ? `SCAN-${new Date(analysisResult.createdAt).getTime().toString(36).toUpperCase()}`
    : `SCAN-${Date.now().toString(36).toUpperCase()}`;

  const hardwareItems = [
    { icon: Camera, name: 'Macro Lens', description: '15x magnification' },
    { icon: Scissors, name: 'Sterile Lancets', description: 'Precision extraction' },
    { icon: Bandage, name: 'Hydrocolloid Patches', description: 'Healing support' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Main Container - Single clean white card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 md:p-8"
        >
          {/* Hero Metric: Dermal Status */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
            <div className={`w-2 h-2 rounded-full ${dermalStatus.color}`} />
            <div>
              <p className="text-xs text-slate-500 font-sans uppercase tracking-wide mb-1">Dermal Status</p>
              <h1 className="text-2xl font-semibold text-slate-900 font-sans tracking-tight">
                {dermalStatus.text}
              </h1>
            </div>
          </div>

          {/* Action Card - Most Important */}
          <div className={`rounded-lg p-6 mb-8 ${
            isExtractionEligible 
              ? 'bg-green-50 border border-green-100' 
              : 'bg-red-50 border border-red-100'
          }`}>
            <p className="text-sm font-medium text-slate-600 mb-2 font-sans">Can I use my kit?</p>
            <p className={`text-base font-medium font-sans ${
              isExtractionEligible ? 'text-green-900' : 'text-red-900'
            }`}>
              {isExtractionEligible 
                ? 'Protocol: Safe for Precision Extraction.'
                : 'Protocol: Professional Care Only. Do not use lancets on this area.'}
            </p>
          </div>

          {/* Human-Readable Summary */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 font-sans">Summary</h2>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-slate-400 mt-1">•</span>
                <div>
                  <span className="text-xs font-medium text-slate-500 font-sans">What we see: </span>
                  <span className="text-sm text-slate-700 font-sans">{summary.whatWeSee}</span>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-400 mt-1">•</span>
                <div>
                  <span className="text-xs font-medium text-slate-500 font-sans">Why it's happening: </span>
                  <span className="text-sm text-slate-700 font-sans">{summary.whyItsHappening}</span>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-400 mt-1">•</span>
                <div>
                  <span className="text-xs font-medium text-slate-500 font-sans">Immediate step: </span>
                  <span className="text-sm text-slate-700 font-sans">{summary.immediateStep}</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Scan Image (if available) */}
          {analysisResult.imagePath && (
            <div className="mb-8">
              <img 
                src={analysisResult.imagePath} 
                alt="Skin scan" 
                className="w-full rounded-lg border border-slate-100"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Technical Details Footer */}
          <div className="pt-6 border-t border-slate-100">
            <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-mono">
              <span>Scan ID: {scanId}</span>
              {analysisResult.gagsScore && (
                <span>GAGS: {analysisResult.gagsScore}/4</span>
              )}
              {analysisResult.aiConfidence !== undefined && (
                <span>Confidence: {(analysisResult.aiConfidence * 100).toFixed(0)}%</span>
              )}
              {analysisResult.lesionType && (
                <span>Type: {analysisResult.lesionType}</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Recommended Tools - Horizontal Bar */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-sm font-medium text-slate-900 mb-4 font-sans">Recommended Tools</h2>
          <div className="flex flex-wrap gap-6 mb-6">
            {hardwareItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                  <div>
                    <p className="text-xs font-medium text-slate-900 font-sans">{item.name}</p>
                    <p className="text-xs text-slate-500 font-sans">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing and CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-semibold text-slate-900 font-sans">£24.00</span>
                <span className="text-sm text-slate-400 line-through font-sans">£40.00</span>
              </div>
              <p className="text-xs text-slate-500 font-sans">Ships Feb 10th • Only 50 units</p>
            </div>
            <a
              href="https://stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors font-sans text-sm"
            >
              Secure Your Kit
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 md:hidden z-50">
        <a
          href="https://stripe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors font-sans text-center text-sm"
        >
          Secure Your Kit
        </a>
      </div>
    </div>
  );
}
