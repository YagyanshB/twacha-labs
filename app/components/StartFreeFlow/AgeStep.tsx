'use client';

import { useState } from 'react';

interface AgeStepProps {
  onSelect: (age: string) => void;
  onBack: () => void;
}

const ageRanges = [
  { id: '18-25', label: '18-25' },
  { id: '26-30', label: '26-30' },
  { id: '31-40', label: '31-40' },
  { id: '41+', label: '41+' },
];

export default function AgeStep({ onSelect, onBack }: AgeStepProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (age: string) => {
    setSelected(age);
    // Auto-advance after selection
    setTimeout(() => {
      onSelect(age);
    }, 200);
  };

  return (
    <div className="funnel-step">
      <div className="funnel-step-content">
        <div className="funnel-header">
          <h1>Age range</h1>
          <p>This helps us personalize your analysis</p>
        </div>

        <div className="option-grid">
          {ageRanges.map((range) => (
            <button
              key={range.id}
              onClick={() => handleSelect(range.id)}
              className={`option-button ${selected === range.id ? 'selected' : ''}`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
