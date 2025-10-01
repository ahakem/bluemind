import React from 'react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  priority?: boolean; // For above-the-fold images
  sizes?: string; // Responsive sizes
  [key: string]: any;
}

/**
 * Optimized responsive image component that:
 * - Uses WebP with fallback
 * - Implements proper sizing to prevent CLS
 * - Supports responsive images
 * - Lazy loads by default (except priority images)
 */
const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  style,
  loading = 'lazy',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  ...props
}) => {
  // Auto-generate fallback formats
  const webpSrc = src.includes('.webp') ? src : src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const fallbackSrc = src.includes('.webp') ? src.replace('.webp', '.jpg') : src;
  
  // Determine loading strategy
  const imageLoading = priority ? 'eager' : loading;
  
  // Responsive image sizes for gallery images
  const generateSrcSet = (baseSrc: string) => {
    if (baseSrc.includes('gallery/')) {
      const base = baseSrc.replace(/\.(webp|jpg|jpeg|png)$/i, '');
      const ext = baseSrc.match(/\.(webp|jpg|jpeg|png)$/i)?.[0] || '.webp';
      
      return [
        `${base}${ext} 400w`,
        `${base}${ext} 800w`,
        `${base}${ext} 1200w`
      ].join(', ');
    }
    return baseSrc;
  };

  const imageStyle: React.CSSProperties = {
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : 'auto',
    objectFit: 'cover',
    ...style
  };

  return (
    <picture>
      {/* WebP source for modern browsers */}
      <source 
        srcSet={generateSrcSet(webpSrc)} 
        sizes={sizes}
        type="image/webp" 
      />
      
      {/* Fallback for older browsers */}
      <img
        src={fallbackSrc}
        srcSet={generateSrcSet(fallbackSrc)}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={imageStyle}
        loading={imageLoading}
        decoding="async"
        {...props}
      />
    </picture>
  );
};

export default ResponsiveImage;