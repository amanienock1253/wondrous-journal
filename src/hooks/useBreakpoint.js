// Tracks window width and returns breakpoint booleans for responsive layouts.
import { useEffect, useState } from 'react';

export function useBreakpoint() {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return {
    isMobile: width < 768,   // phone
    isDesktop: width >= 768, // tablet/desktop — show sidebar
    isWide: width >= 1200,   // wide desktop — show 3-col split panel
    width,
  };
}
