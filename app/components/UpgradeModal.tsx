'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const router = useRouter();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    router.push('/pricing');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        onClick={handleBackdropClick}
      >
        
        {/* Modal */}
        <div className="bg-white rounded-2xl max-w-lg w-full relative">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Content */}
          <div className="p-8 sm:p-12">
            
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-light tracking-tight mb-4">
                Monthly limit reached
              </h2>
              <p className="text-gray-600 font-light leading-relaxed">
                You've used your 1 free analysis this month. Upgrade for unlimited access.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                <span className="text-gray-900 font-light">Unlimited analyses</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                <span className="text-gray-900 font-light">Advanced metrics (texture, aging)</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                <span className="text-gray-900 font-light">Progress tracking timeline</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                <span className="text-gray-900 font-light">Priority support</span>
              </div>
            </div>

            {/* Price */}
            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center space-x-2">
                <span className="text-4xl font-light">£7.99</span>
                <span className="text-gray-500 font-light">/month</span>
              </div>
              <p className="text-sm text-gray-500 mt-2 font-light">Cancel anytime</p>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <button 
                onClick={handleUpgrade}
                className="w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 transition flex items-center justify-center group"
              >
                Upgrade to Premium
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={onClose}
                className="w-full text-gray-600 py-3 rounded-full font-light hover:text-gray-900 transition"
              >
                Maybe later
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
