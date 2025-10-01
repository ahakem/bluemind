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

// Hook for intersection observer-based lazy loading
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasIntersected) {
          setIsIntersecting(true);
          setHasIntersected(true);
          observer.unobserve(element);
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [hasIntersected]);

  return { elementRef, isIntersecting, hasIntersected };
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      loading={priority ? 'eager' : loading}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
      onLoad={handleLoad}
      onError={handleError}
      sx={{
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        backgroundColor: hasError ? '#f5f5f5' : 'transparent',
        ...sx,
      }}
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

// Advanced lazy image with intersection observer
export const LazyImage = ({ src, alt, className, style, sx, ...props }: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { elementRef, isIntersecting, hasIntersected } = useIntersectionObserver();

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  return (
    <Box
      ref={elementRef}
      component="img"
      src={isIntersecting || hasIntersected ? src : undefined}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={handleLoad}
      onError={handleError}
      sx={{
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        backgroundColor: hasError ? '#f5f5f5' : '#e5e7eb',
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
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