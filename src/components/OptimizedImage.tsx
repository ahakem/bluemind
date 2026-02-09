'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { Box, Skeleton } from '@mui/material';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad'> {
  alt: string;
  sx?: any;
  containerSx?: any;
  showSkeleton?: boolean;
}

export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  fill,
  priority = false,
  sx,
  containerSx,
  showSkeleton = true,
  sizes,
  ...props
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Box
      sx={{
        position: fill ? 'relative' : 'static',
        overflow: 'hidden',
        ...containerSx,
      }}
    >
      {showSkeleton && isLoading && (
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
          }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        quality={85}
        onLoad={() => setIsLoading(false)}
        style={{
          objectFit: 'cover',
          ...sx,
        }}
        {...props}
      />
    </Box>
  );
};

export const LazyImage = (props: OptimizedImageProps) => {
  return <OptimizedImage {...props} priority={false} />;
};

export const PriorityImage = (props: OptimizedImageProps) => {
  return <OptimizedImage {...props} priority={true} showSkeleton={false} />;
};
