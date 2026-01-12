import { useState, useEffect } from 'react';

/**
 * Custom hook to detect media query matches
 * @param {string} query - CSS media query string
 * @returns {boolean} - Whether the media query matches
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event) => setMatches(event.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

/**
 * Predefined breakpoint hooks
 */
export const useIsMobile = () => useMediaQuery('(max-width: 639px)');
export const useIsTablet = () => useMediaQuery('(max-width: 1023px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');

/**
 * Detect if app is running as installed PWA
 */
export const useIsPWA = () => {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const checkPWA = () => {
      // Check display-mode media query
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // Check iOS Safari's navigator.standalone
      const isIOSStandalone = window.navigator.standalone === true;
      // Check if launched from home screen on Android
      const isAndroidPWA = window.matchMedia('(display-mode: fullscreen)').matches;

      setIsPWA(isStandalone || isIOSStandalone || isAndroidPWA);
    };

    checkPWA();
  }, []);

  return isPWA;
};

export default useMediaQuery;
