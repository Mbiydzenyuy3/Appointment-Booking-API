import React, { Suspense } from "react";
import {
  useLazyComponent,
  LazyImage,
  useLazyImage
} from "../../hooks/useLazyLoading";

/**
 * Loading component for lazy-loaded components
 */
export const LazyLoadingSpinner = ({
  size = "medium",
  message = "Loading..."
}) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12"
  };

  return (
    <div className='flex flex-col items-center justify-center p-8'>
      <div
        className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}
      ></div>
      {message && <p className='mt-2 text-gray-600 text-sm'>{message}</p>}
    </div>
  );
};

/**
 * Error component for lazy-loaded components
 */
export const LazyErrorBoundary = ({
  error,
  retry,
  message = "Something went wrong"
}) => {
  return (
    <div className='flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200'>
      <div className='text-red-600 mb-4'>
        <svg
          className='w-12 h-12'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
          />
        </svg>
      </div>
      <h3 className='text-lg font-semibold text-red-800 mb-2'>
        Error Loading Component
      </h3>
      <p className='text-red-600 text-center mb-4'>{message}</p>
      {error && (
        <details className='text-sm text-red-500 mb-4'>
          <summary className='cursor-pointer'>Error Details</summary>
          <pre className='mt-2 p-2 bg-red-100 rounded overflow-auto'>
            {error.message}
          </pre>
        </details>
      )}
      {retry && (
        <button
          onClick={retry}
          className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors'
        >
          Try Again
        </button>
      )}
    </div>
  );
};

/**
 * Wrapper component for lazy-loaded components with error handling
 */
export const LazyWrapper = ({
  importFunc,
  fallback = null,
  errorFallback = null,
  loadingComponent = <LazyLoadingSpinner />,
  ...props
}) => {
  const {
    component: Component,
    isLoading,
    error
  } = useLazyComponent(importFunc);

  if (error && errorFallback) {
    return <div>{errorFallback}</div>;
  }

  if (error) {
    return <LazyErrorBoundary error={error} />;
  }

  if (isLoading) {
    return <div>{fallback || loadingComponent}</div>;
  }

  if (Component) {
    return <Component {...props} />;
  }

  return null;
};

/**
 * Component for lazy loading images with optimized settings
 */
export const OptimizedImage = ({
  src,
  alt,
  className = "",
  quality = 85,
  format = "auto",
  ...props
}) => {
  // Add image optimization parameters if using a CDN
  const optimizedSrc = src.includes("?")
    ? `${src}&q=${quality}&f=${format}`
    : `${src}?q=${quality}&f=${format}`;

  return (
    <LazyImage
      src={optimizedSrc}
      alt={alt}
      className={className}
      placeholder={
        <div className={`bg-gray-200 animate-pulse ${className}`}>
          <svg
            className='w-full h-full text-gray-400'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path
              fillRule='evenodd'
              d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z'
              clipRule='evenodd'
            />
          </svg>
        </div>
      }
      {...props}
    />
  );
};

/**
 * Component for lazy loading background images
 */
export const LazyBackgroundImage = ({
  src,
  children,
  className = "",
  style = {},
  ...props
}) => {
  const { imageSrc, isLoaded, ref } = useLazyImage(src);

  const backgroundStyle = {
    backgroundImage: `url(${imageSrc})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    ...style
  };

  return (
    <div
      ref={ref}
      className={`lazy-background-container ${className}`}
      style={backgroundStyle}
      {...props}
    >
      {!isLoaded && (
        <div className='absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center'>
          <svg
            className='w-16 h-16 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
            />
          </svg>
        </div>
      )}
      <div
        className={isLoaded ? "opacity-100" : "opacity-0"}
        style={{ transition: "opacity 0.3s ease" }}
      >
        {children}
      </div>
    </div>
  );
};
