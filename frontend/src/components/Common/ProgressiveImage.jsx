import React from "react";
import { LazyImage } from "../../hooks/useLazyLoading";

/**
 * ProgressiveImage component that supports WebP with fallbacks
 * Implements mobile-first progressive loading for slow networks
 */
const ProgressiveImage = ({
  src,
  webpSrc,
  alt = "",
  className = "",
  priority = false,
  ...props
}) => {
  // For critical content (above the fold), load immediately
  if (priority) {
    return (
      <picture className={className}>
        {webpSrc && <source srcSet={webpSrc} type='image/webp' />}
        <img src={src} alt={alt} loading='eager' decoding='sync' {...props} />
      </picture>
    );
  }

  // For non-critical content, use lazy loading
  return <LazyImage src={src} alt={alt} className={className} {...props} />;
};

export default ProgressiveImage;
