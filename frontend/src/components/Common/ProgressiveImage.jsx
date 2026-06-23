import React, { useState, useEffect } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";

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
        <PhotoIcon className='w-8 h-8' />
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
