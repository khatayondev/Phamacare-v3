/**
 * Mobile Utilities for PharmaCare
 * Helper functions for mobile-responsive behavior
 */

// Detect if device is mobile
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

// Detect if device is tablet
export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 768 && window.innerWidth < 1024;
};

// Detect if device is touch-enabled
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Get viewport dimensions
export const getViewportDimensions = () => {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

// Detect orientation
export const getOrientation = (): 'portrait' | 'landscape' => {
  if (typeof window === 'undefined') return 'portrait';
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
};

// Vibrate device (for touch feedback)
export const vibrate = (duration: number = 10) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(duration);
  }
};

// Prevent body scroll (useful for modals on mobile)
export const preventBodyScroll = (prevent: boolean) => {
  if (typeof document === 'undefined') return;
  
  if (prevent) {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  } else {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
  }
};

// Get safe area insets
export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const getInset = (position: string) => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(`--safe-area-inset-${position}`);
    return parseInt(value, 10) || 0;
  };

  return {
    top: getInset('top'),
    right: getInset('right'),
    bottom: getInset('bottom'),
    left: getInset('left'),
  };
};

// Smooth scroll to element
export const scrollToElement = (elementId: string, offset: number = 0) => {
  if (typeof document === 'undefined') return;
  
  const element = document.getElementById(elementId);
  if (element) {
    const y = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
};

// Copy to clipboard with mobile support
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older mobile browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      textArea.remove();
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

// Share API for mobile
export const shareContent = async (data: {
  title?: string;
  text?: string;
  url?: string;
}): Promise<boolean> => {
  if (typeof navigator === 'undefined' || !navigator.share) {
    return false;
  }

  try {
    await navigator.share(data);
    return true;
  } catch (error) {
    // User cancelled or share failed
    return false;
  }
};

// Detect if app is in standalone mode (PWA)
export const isStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
};

// Get device pixel ratio
export const getDevicePixelRatio = (): number => {
  if (typeof window === 'undefined') return 1;
  return window.devicePixelRatio || 1;
};

// Debounce function for resize events
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Format large numbers for mobile display
export const formatCompactNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Truncate text for mobile display
export const truncateText = (text: string, maxLength: number = 30): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

// Request wake lock (prevent screen sleep)
export const requestWakeLock = async (): Promise<any | null> => {
  if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
    return null;
  }

  try {
    const wakeLock = await (navigator as any).wakeLock.request('screen');
    return wakeLock;
  } catch (error) {
    console.error('Wake lock request failed:', error);
    return null;
  }
};

// Check if device has notch (safe area)
export const hasNotch = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const safeAreaTop = getComputedStyle(document.documentElement)
    .getPropertyValue('--safe-area-inset-top');
  
  return safeAreaTop !== '0px' && safeAreaTop !== '';
};

// Get network status
export const getNetworkStatus = () => {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return {
      online: navigator.onLine,
      type: 'unknown',
      effectiveType: 'unknown',
    };
  }

  const connection = (navigator as any).connection;
  return {
    online: navigator.onLine,
    type: connection.type || 'unknown',
    effectiveType: connection.effectiveType || 'unknown',
    downlink: connection.downlink,
    rtt: connection.rtt,
  };
};

// Mobile-optimized date formatting
export const formatDateMobile = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default {
  isMobile,
  isTablet,
  isTouchDevice,
  getViewportDimensions,
  getOrientation,
  vibrate,
  preventBodyScroll,
  getSafeAreaInsets,
  scrollToElement,
  copyToClipboard,
  shareContent,
  isStandalone,
  getDevicePixelRatio,
  debounce,
  throttle,
  formatCompactNumber,
  truncateText,
  requestWakeLock,
  hasNotch,
  getNetworkStatus,
  formatDateMobile,
};
