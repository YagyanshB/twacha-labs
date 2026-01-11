'use client';

import { useState } from 'react';
import { Shield, Check } from 'lucide-react';

interface ConsentStepProps {
  onConsent: () => void;
  onBack: () => void;
}

export default function ConsentStep({ onConsent, onBack }: ConsentStepProps) {
  const [consentGiven, setConsentGiven] = useState(false);
  const [readPrivacy, setReadPrivacy] = useState(false);

  const handleContinue = () => {
    if (consentGiven && readPrivacy) {
      onConsent();
    }
  };

  return (
    <div className="consent-step">
      <div className="consent-step-content">
        {/* Title */}
        <div className="funnel-header">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1>Clinical Consent Required</h1>
          <p>
            We need your explicit consent to process biometric data for skin analysis
          </p>
        </div>

        {/* Consent Information */}
        <div className="consent-info">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-[#1E293B] mb-3">What we collect:</h3>
            <ul className="space-y-2 text-sm text-[#52525B]">
              <li>• Biometric data (facial images) for skin analysis</li>
              <li>• Age and skin type information</li>
              <li>• Analysis results and recommendations</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-[#1E293B] mb-3">How we protect your data:</h3>
            <ul className="space-y-2 text-sm text-[#52525B]">
              <li>• End-to-end encryption for all data transfers</li>
              <li>• Secure storage in GDPR-compliant infrastructure</li>
              <li>• No data sharing with third parties without consent</li>
              <li>• Right to deletion at any time</li>
            </ul>
          </div>
        </div>

        {/* Consent Checkboxes */}
        <div className="consent-checkboxes space-y-4">
          {/* Mandatory: Explicit Consent for Biometric Data Processing */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="sr-only"
                required
              />
              <div
                className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                  consentGiven
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-300 group-hover:border-blue-400'
                }`}
              >
                {consentGiven && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>
            <div className="flex-1">
              <span className="text-[#1E293B] font-medium">
                I explicitly consent to the processing of my biometric data (facial images) for skin analysis purposes
                <span className="text-red-500 ml-1">*</span>
              </span>
              <p className="text-sm text-[#52525B] mt-1">
                This is required under GDPR Article 9 for special category data processing
              </p>
            </div>
          </label>

          {/* Optional: Privacy Policy Read */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={readPrivacy}
                onChange={(e) => setReadPrivacy(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                  readPrivacy
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-300 group-hover:border-blue-400'
                }`}
              >
                {readPrivacy && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>
            <div className="flex-1">
              <span className="text-[#1E293B]">
                I have read and understood the{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  Privacy Policy
                </a>
              </span>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="consent-actions">
          <button
            onClick={handleContinue}
            disabled={!consentGiven || !readPrivacy}
            className={`primary-cta camera-button ${
              !consentGiven || !readPrivacy ? 'disabled' : ''
            }`}
          >
            Continue to Scan
          </button>
          <button
            onClick={onBack}
            className="secondary-cta camera-button"
          >
            Cancel
          </button>
        </div>

        {/* Helper Text */}
        <p className="helper-text text-xs text-[#52525B] text-center mt-4">
          You can withdraw your consent at any time by contacting us or using the deletion feature in your account settings.
        </p>
      </div>
    </div>
  );
}
