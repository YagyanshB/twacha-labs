'use client';

import { useState } from 'react';

interface SkinTypeStepProps {
  onSelect: (skinType: string) => void;
  onBack: () => void;
}

const skinTypes = [
  { id: 'oily', label: 'Oily' },
  { id: 'dry', label: 'Dry' },
  { id: 'combination', label: 'Combination' },
  { id: 'normal', label: 'Normal' },
  { id: 'not-sure', label: 'Not sure' },
];

export default function SkinTypeStep({ onSelect, onBack }: SkinTypeStepProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (skinType: string) => {
    setSelected(skinType);
    // Auto-advance after selection
    setTimeout(() => {
      onSelect(skinType);
    }, 200);
  };

  return (
    <div className="funnel-step">
      <div className="funnel-step-content">
        <div className="funnel-header">
          <h1>Skin type</h1>
          <p>Not sure? We'll help you figure it out</p>
        </div>

        <div className="option-grid">
          {skinTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleSelect(type.id)}
              className={`option-button ${selected === type.id ? 'selected' : ''}`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
