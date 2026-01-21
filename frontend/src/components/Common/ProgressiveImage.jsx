import React, { useState, useEffect } from "react";

const ProgressiveImage = ({
  src,
  placeholder,
  alt,
  className = "",
  onLoad,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder || src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
      if (onLoad) onLoad();
    };

    img.onerror = () => {
      setHasError(true);
      // If main image fails, try to use placeholder or show error state
      if (placeholder && placeholder !== src) {
        setImageSrc(placeholder);
      }
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, placeholder, onLoad]);

  if (hasError && !placeholder) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 text-gray-400 ${className}`}
        {...props}
      >
        <svg className='w-8 h-8' fill='currentColor' viewBox='0 0 20 20'>
          <path
            fillRule='evenodd'
            d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z'
            clipRule='evenodd'
          />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`${className} ${
        isLoaded ? "opacity-100" : "opacity-70"
      } transition-opacity duration-300`}
      style={{
        filter: isLoaded ? "none" : "blur(10px)",
        transform: isLoaded ? "scale(1)" : "scale(1.1)"
      }}
      {...props}
    />
  );
};

export default ProgressiveImage;
