/**
 * Skin color detection using YCbCr color space
 * Works for various skin tones
 */

export function isSkinColor(r: number, g: number, b: number): boolean {
  // Convert RGB to YCbCr color space
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  
  // Skin color ranges (works for various skin tones)
  return cr > 135 && cr < 180 && cb > 85 && cb < 135 && y > 80;
}

export interface FaceDetectionResult {
  detected: boolean;
  centerX?: number;
  centerY?: number;
  faceWidth?: number;
  faceHeight?: number;
  centered?: boolean;
  distance?: 'too_far' | 'good' | 'too_close';
}

export function detectFace(
  imageData: ImageData, 
  width: number, 
  height: number
): FaceDetectionResult {
  const data = imageData.data;
  const skinPixels: { x: number; y: number }[] = [];
  
  // Sample every 8th pixel for performance
  for (let y = 0; y < height; y += 8) {
    for (let x = 0; x < width; x += 8) {
      const i = (y * width + x) * 4;
      if (isSkinColor(data[i], data[i + 1], data[i + 2])) {
        skinPixels.push({ x, y });
      }
    }
  }
  
  if (skinPixels.length < 50) {
    return { detected: false };
  }
  
  // Calculate bounding box
  const xs = skinPixels.map(p => p.x);
  const ys = skinPixels.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const faceWidth = maxX - minX;
  const faceHeight = maxY - minY;
  
  // Check if centered (within 15% of center)
  const frameCenterX = width / 2;
  const frameCenterY = height / 2;
  const threshold = width * 0.15;
  const centered = 
    Math.abs(centerX - frameCenterX) < threshold &&
    Math.abs(centerY - frameCenterY) < threshold;
  
  // Check distance based on face size ratio
  const faceRatio = faceHeight / height;
  let distance: 'too_far' | 'good' | 'too_close' = 'good';
  if (faceRatio < 0.3) distance = 'too_far';
  else if (faceRatio > 0.7) distance = 'too_close';
  
  return {
    detected: true,
    centerX,
    centerY,
    faceWidth,
    faceHeight,
    centered,
    distance,
  };
}
