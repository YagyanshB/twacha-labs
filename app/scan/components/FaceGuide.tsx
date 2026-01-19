'use client';

import { useEffect } from 'react';

interface FaceGuideProps {
  width: number;
  height: number;
  isOptimal: boolean;
  faceDetected: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export function FaceGuide({ width, height, isOptimal, faceDetected, canvasRef }: FaceGuideProps) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const ovalWidth = width * 0.35;
    const ovalHeight = height * 0.55;
    
    // Determine color
    let color = 'rgba(255, 255, 255, 0.5)'; // Default
    if (isOptimal) {
      color = 'rgba(34, 197, 94, 0.8)'; // Green
    } else if (faceDetected) {
      color = 'rgba(250, 204, 21, 0.7)'; // Yellow
    }
    
    // Draw oval
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, ovalWidth, ovalHeight, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.setLineDash(isOptimal ? [] : [10, 10]);
    ctx.stroke();
    
    // Draw corner brackets
    ctx.setLineDash([]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    const bracketSize = 30;
    const offset = 20;
    
    // Top-left
    ctx.beginPath();
    ctx.moveTo(centerX - ovalWidth - offset, centerY - ovalHeight + bracketSize);
    ctx.lineTo(centerX - ovalWidth - offset, centerY - ovalHeight - offset);
    ctx.lineTo(centerX - ovalWidth + bracketSize, centerY - ovalHeight - offset);
    ctx.stroke();
    
    // Top-right
    ctx.beginPath();
    ctx.moveTo(centerX + ovalWidth + offset, centerY - ovalHeight + bracketSize);
    ctx.lineTo(centerX + ovalWidth + offset, centerY - ovalHeight - offset);
    ctx.lineTo(centerX + ovalWidth - bracketSize, centerY - ovalHeight - offset);
    ctx.stroke();
    
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(centerX - ovalWidth - offset, centerY + ovalHeight - bracketSize);
    ctx.lineTo(centerX - ovalWidth - offset, centerY + ovalHeight + offset);
    ctx.lineTo(centerX - ovalWidth + bracketSize, centerY + ovalHeight + offset);
    ctx.stroke();
    
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(centerX + ovalWidth + offset, centerY + ovalHeight - bracketSize);
    ctx.lineTo(centerX + ovalWidth + offset, centerY + ovalHeight + offset);
    ctx.lineTo(centerX + ovalWidth - bracketSize, centerY + ovalHeight + offset);
    ctx.stroke();
  }, [width, height, isOptimal, faceDetected, canvasRef]);

  return null;
}
