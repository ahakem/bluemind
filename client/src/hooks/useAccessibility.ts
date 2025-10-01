import { useEffect } from 'react';

/**
 * Enhanced focus management for accessibility
 * Provides better keyboard navigation and focus indicators
 */
export const useAccessibilityEnhancements = () => {
  useEffect(() => {
    // Add enhanced focus styles
    const style = document.createElement('style');
    style.textContent = `
      /* Enhanced focus indicators */
      *:focus {
        outline: 2px solid #0056b3 !important;
        outline-offset: 2px !important;
      }
      
      /* Skip link focus styles */
      .skip-link:focus {
        position: absolute !important;
        left: 8px !important;
        top: 8px !important;
        z-index: 9999 !important;
        background: #000 !important;
        color: #fff !important;
        padding: 8px 16px !important;
        text-decoration: none !important;
        border-radius: 4px !important;
      }
      
      /* Improve button focus */
      button:focus,
      .MuiButton-root:focus {
        box-shadow: 0 0 0 3px rgba(0, 86, 179, 0.3) !important;
      }
      
      /* Improve link focus */
      a:focus {
        box-shadow: 0 0 0 3px rgba(0, 86, 179, 0.3) !important;
        border-radius: 2px !important;
      }
      
      /* High contrast mode support */
      @media (prefers-contrast: high) {
        * {
          border-color: ButtonText !important;
        }
        
        button, .MuiButton-root {
          border: 2px solid ButtonText !important;
        }
      }
      
      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }
      
      /* Focus within for card interactions */
      .MuiCard-root:focus-within {
        box-shadow: 0 0 0 3px rgba(0, 86, 179, 0.3) !important;
        transform: translateY(-2px) !important;
      }
    `;
    
    document.head.appendChild(style);
    
    // Enhanced keyboard navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key handling for modals and overlays
      if (event.key === 'Escape') {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.closest('[role="dialog"]')) {
          const closeButton = activeElement.closest('[role="dialog"]')?.querySelector('[aria-label*="close"], [aria-label*="Close"]') as HTMLElement;
          closeButton?.click();
        }
      }
      
      // Alt + 1 to skip to main content
      if (event.altKey && event.key === '1') {
        event.preventDefault();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.focus();
          mainContent.scrollIntoView({ behavior: 'smooth' });
        }
      }
      
      // Alt + 2 to skip to navigation
      if (event.altKey && event.key === '2') {
        event.preventDefault();
        const navigation = document.getElementById('navigation');
        if (navigation) {
          navigation.focus();
          navigation.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Announce page changes to screen readers
    const announcePageChange = () => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
      
      const pageTitle = document.title;
      announcement.textContent = `Page loaded: ${pageTitle}`;
      
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    };
    
    // Announce on initial load
    setTimeout(announcePageChange, 100);
    
    return () => {
      document.head.removeChild(style);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
};

// Screen reader only utility class
export const srOnlyStyles = {
  position: 'absolute',
  left: '-10000px',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
} as const;