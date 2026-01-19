import { useRef, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
  time: number;
}

export function useStabilityCheck(threshold = 20, bufferSize = 10) {
  const positionBuffer = useRef<Position[]>([]);
  
  const checkStability = useCallback((x: number, y: number): boolean => {
    positionBuffer.current.push({ x, y, time: Date.now() });
    
    if (positionBuffer.current.length > bufferSize) {
      positionBuffer.current.shift();
    }
    
    if (positionBuffer.current.length < bufferSize) {
      return false;
    }
    
    const positions = positionBuffer.current;
    const avgX = positions.reduce((sum, p) => sum + p.x, 0) / positions.length;
    const avgY = positions.reduce((sum, p) => sum + p.y, 0) / positions.length;
    
    return positions.every(p =>
      Math.abs(p.x - avgX) < threshold && Math.abs(p.y - avgY) < threshold
    );
  }, [threshold, bufferSize]);
  
  const reset = useCallback(() => {
    positionBuffer.current = [];
  }, []);
  
  return { checkStability, reset };
}
