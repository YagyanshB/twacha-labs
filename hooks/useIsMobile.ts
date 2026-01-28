'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect if user is on mobile device
 * Checks both screen width and user agent for accurate detection
 * Returns true for screens < 768px width or mobile user agents
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side only)
    if (typeof window === 'undefined') {
      return;
    }

    const checkMobile = () => {
      // Check screen width
      const isMobileWidth = window.innerWidth < 768;

      // Check user agent for mobile devices (iPhone, Android, etc.)
      const isMobileUA = /iPhone|iPad|iPod|Android|webOS|BlackBerry|Windows Phone/i.test(
        navigator.userAgent
      );

      setIsMobile(isMobileWidth || isMobileUA);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
