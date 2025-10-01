import { useState, useRef, useEffect } from 'react';
import { Box } from '@mui/material';

interface OptimizedImageProps {
  src: string;
  alt: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
  sx?: any;
  className?: string;
}

// Simplified hook for intersection observer (only when needed)
const useIntersectionObserver = (enabled: boolean) => {
  const [isVisible, setIsVisible] = useState(!enabled);
  const elementRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!enabled) return;
    
    const element = elementRef.current;
    if (!element) return;

    // Use native loading="lazy" if supported
    if ('loading' in HTMLImageElement.prototype) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled]);

  return { elementRef, isVisible };
};

export const OptimizedImage = ({
  src,
  alt,
  loading = 'lazy',
  priority = false,
  sizes,
  style,
  sx,
  className,
  ...props
}: OptimizedImageProps) => {
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      loading={priority ? 'eager' : loading}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
      sx={sx}
      style={{
        maxWidth: '100%',
        height: 'auto',
        ...style,
      }}
      className={className}
      {...props}
    />
  );
};

// Simplified lazy image - rely on native loading="lazy" for better performance
export const LazyImage = ({ src, alt, className, style, sx, ...props }: OptimizedImageProps) => {
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      sx={sx}
      style={{
        maxWidth: '100%',
        height: 'auto',
        ...style,
      }}
      className={className}
      {...props}
    />
  );
};

// Priority image for above-the-fold content
export const PriorityImage = ({ src, alt, className, style, ...props }: OptimizedImageProps) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      loading="eager"
      priority={true}
      className={className}
      style={style}
      {...props}
    />
  );
};