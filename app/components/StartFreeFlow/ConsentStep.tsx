'use client';

import { useState } from 'react';
import { Shield, Check } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="consent-step"
    >
      <div className="consent-step-content">
        {/* Title */}
        <div className="funnel-header">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-slate-400" />
          </div>
          <h1 className="font-sans tracking-tight">Clinical Consent</h1>
          <p className="text-slate-600">
            We need your explicit consent to process biometric data
          </p>
        </div>

        {/* Information List */}
        <div className="consent-info-list">
          <div className="info-row">
            <span className="info-label">Data Collection:</span>
            <span className="info-value">Biometric facial markers for GAGS analysis.</span>
          </div>
          <div className="info-row">
            <span className="info-label">Security:</span>
            <span className="info-value">End-to-end encryption via Supabase Clinical Vault.</span>
          </div>
          <div className="info-row">
            <span className="info-label">Rights:</span>
            <span className="info-value">GDPR Article 9 compliant. Right to deletion at any time.</span>
          </div>
        </div>

        {/* Consent Checkboxes */}
        <div className="consent-checkboxes">
          {/* Mandatory: Explicit Consent */}
          <label className="consent-checkbox-label">
            <div className="consent-checkbox-wrapper">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="consent-checkbox-input"
                required
              />
              <div className={`consent-checkbox ${consentGiven ? 'checked' : ''}`}>
                {consentGiven && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>
            <div className="consent-checkbox-text">
              <span className="consent-checkbox-main">
                I explicitly consent to the processing of my biometric data (facial images) for skin analysis purposes
                <span className="text-red-500 ml-1">*</span>
              </span>
              <span className="consent-checkbox-footnote">
                GDPR Article 9 for special category data processing
              </span>
            </div>
          </label>

          {/* Privacy Policy Read */}
          <label className="consent-checkbox-label">
            <div className="consent-checkbox-wrapper">
              <input
                type="checkbox"
                checked={readPrivacy}
                onChange={(e) => setReadPrivacy(e.target.checked)}
                className="consent-checkbox-input"
              />
              <div className={`consent-checkbox ${readPrivacy ? 'checked' : ''}`}>
                {readPrivacy && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>
            <div className="consent-checkbox-text">
              <span className="consent-checkbox-main">
                I have read and understood the{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="consent-link"
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
            className={`consent-button-primary ${!consentGiven || !readPrivacy ? 'disabled' : ''}`}
          >
            Continue to Scan
          </button>
          <button
            onClick={onBack}
            className="consent-button-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}
