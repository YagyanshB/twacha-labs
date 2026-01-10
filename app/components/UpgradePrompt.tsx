'use client';

import { ArrowRight, Zap, Lock } from 'lucide-react';
import Link from 'next/link';

interface UpgradePromptProps {
  variant: 'limit-reached' | 'premium-feature' | 'soft-prompt';
  analysisCount?: number;
  feature?: string;
  onClose?: () => void;
}

export default function UpgradePrompt({ variant, analysisCount, feature, onClose }: UpgradePromptProps) {
  if (variant === 'limit-reached') {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-6 mx-auto">
            <Lock className="w-8 h-8 text-zinc-400" />
          </div>
          
          <h2 className="text-2xl font-bold mb-4 text-center">
            Monthly limit reached
          </h2>
          <p className="text-zinc-400 mb-6 text-center">
            You've used your 1 free analysis this month. Upgrade to Premium for unlimited analyses and advanced features.
          </p>
          
          <div className="bg-black rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-400">Your usage</span>
              <span className="font-semibold">{analysisCount || 1}/1</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div className="bg-white rounded-full h-2 w-full"></div>
            </div>
          </div>
          
          <Link
            href="/pricing"
            className="block w-full bg-white text-black py-4 rounded-lg font-semibold text-center hover:bg-zinc-100 transition mb-3"
          >
            Upgrade to Premium - £4.99/mo
          </Link>
          
          <button
            onClick={onClose || (() => window.history.back())}
            className="w-full text-zinc-400 py-3 rounded-lg font-medium hover:text-white transition"
          >
            Maybe later
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'premium-feature') {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-zinc-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Premium Feature</h3>
            <p className="text-sm text-zinc-400 mb-4">
              {feature || 'This feature'} is only available for Premium members.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-sm text-white hover:text-zinc-300 transition"
            >
              Upgrade to unlock
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Soft prompt (after analysis)
  return (
    <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Zap className="w-6 h-6 text-white" />
        <h3 className="text-lg font-semibold">Want more insights?</h3>
      </div>
      <p className="text-zinc-400 text-sm mb-4">
        Premium members get unlimited analyses, progress tracking, and personalized routines.
      </p>
      <div className="flex gap-3">
        <Link
          href="/pricing"
          className="flex-1 bg-white text-black py-3 rounded-lg font-medium text-center hover:bg-zinc-100 transition text-sm"
        >
          Upgrade
        </Link>
        <button 
          onClick={onClose}
          className="flex-1 bg-zinc-800 text-white py-3 rounded-lg font-medium hover:bg-zinc-700 transition text-sm"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
