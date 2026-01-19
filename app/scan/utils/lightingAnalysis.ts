/**
 * Lighting analysis utility
 * Analyzes average brightness of image to determine lighting quality
 */

export interface LightingResult {
  level: 'too_dark' | 'okay' | 'good' | 'too_bright';
  score: number;
}

export function analyzeLighting(imageData: ImageData): LightingResult {
  const data = imageData.data;
  let totalBrightness = 0;
  let sampleCount = 0;
  
  // Sample every 100th pixel
  for (let i = 0; i < data.length; i += 400) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    totalBrightness += (r + g + b) / 3;
    sampleCount++;
  }
  
  const avgBrightness = totalBrightness / sampleCount;
  let score = Math.min(100, Math.max(0, (avgBrightness / 255) * 100));
  
  let level: 'too_dark' | 'okay' | 'good' | 'too_bright';
  
  if (avgBrightness > 80 && avgBrightness < 200) {
    level = 'good';
    score = Math.min(100, score + 20);
  } else if (avgBrightness > 50 && avgBrightness < 220) {
    level = 'okay';
  } else if (avgBrightness <= 50) {
    level = 'too_dark';
  } else {
    level = 'too_bright';
  }
  
  return { level, score: Math.round(score) };
}
