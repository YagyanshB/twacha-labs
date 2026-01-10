'use client';

export default function LoadingStep() {
  return (
    <div className="funnel-step">
      <div className="funnel-step-content">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h1>Analyzing your skin...</h1>
          <p>This will take a few seconds</p>
        </div>
      </div>
    </div>
  );
}
