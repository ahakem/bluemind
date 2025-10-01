import { useState } from 'react';
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

// High-performance image with intersection observer for better lazy loading
export const LazyImage = ({ src, alt, className, style, ...props }: OptimizedImageProps) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      style={style}
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