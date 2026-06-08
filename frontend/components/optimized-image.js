// frontend/components/optimized-image.js
// Next.js Image component wrapper with optimization

'use client';

import Image from 'next/image';
import { useState } from 'react';

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  blur = true,
  ...props
}) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={80}
        placeholder={blur ? 'blur' : 'empty'}
        blurDataURL={blur ? 'data:image/svg+xml;base64,...' : undefined}
        loading={priority ? 'eager' : 'lazy'}
        style={{
          width: '100%',
          height: 'auto',
          transition: isLoading ? 'none' : 'opacity 300ms ease',
          opacity: isLoading ? 0.5 : 1,
        }}
        onLoadingComplete={() => setIsLoading(false)}
        {...props}
      />
    </div>
  );
}

export default OptimizedImage;
