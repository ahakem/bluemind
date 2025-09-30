import React from 'react';

interface WebPImageProps {
  src: string; // WebP image source
  fallback?: string; // Fallback image (JPG/PNG)
  alt: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  [key: string]: any; // Allow additional props
}

/**
 * WebPImage component that provides WebP images with automatic fallback
 * for browsers that don't support WebP format.
 * 
 * For GitHub Pages deployment, this uses the HTML <picture> element
 * which is widely supported and doesn't require JavaScript.
 */
const WebPImage: React.FC<WebPImageProps> = ({
  src,
  fallback,
  alt,
  width,
  height,
  className,
  style,
  loading = 'lazy',
  ...props
}) => {
  // Auto-generate fallback by replacing .webp with original extension
  const autoFallback = fallback || src.replace('.webp', '.jpg');

  return (
    <picture>
      {/* WebP source for modern browsers */}
      <source srcSet={src} type="image/webp" />
      {/* Fallback for older browsers */}
      <img
        src={autoFallback}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
        loading={loading}
        {...props}
      />
    </picture>
  );
};

export default WebPImage;