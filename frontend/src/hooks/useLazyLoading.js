import { useState, useEffect, useRef } from "react";

/**
 * Custom hook for lazy loading components
 * @param {Function} importFunc - Dynamic import function for the component
 * @returns {Object} { component: ComponentType, isLoading: boolean, error: Error | null }
 */
export const useLazyComponent = (importFunc) => {
  const [component, setComponent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    importFunc()
      .then((module) => {
        if (isMounted) {
          setComponent(module.default || module);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [importFunc]);

  return { component, isLoading, error };
};

/**
 * Custom hook for lazy loading images
 * @param {string} src - Image source URL
 * @param {Object} options - Image loading options
 * @returns {Object} { imageSrc, isLoaded, isInView, ref, setCurrentSrc }
 */
export const useLazyImage = (src, options = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(null);
  const imgRef = useRef();

  const {
    threshold = 0.1,
    rootMargin = "50px",
    placeholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTAwIDYyLjQ4NzIgMTA3LjQ4NyA1NSAxMTUgNTVDMTIyLjUxMyA1NSAxMzAgNjIuNDg3MiAxMzAgNzBDMTMwIDc3LjUxMyAxMjIuNTEzIDg1IDExNSA4NUMxMDcuNDg3IDg1IDEwMCA3Ny41MTMgMTAwIDcwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K"
  } = options;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (isInView && src) {
      setCurrentSrc(src);
    }
  }, [isInView, src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    console.warn(`Failed to load image: ${src}`);
  };

  return {
    imageSrc: isInView ? currentSrc || src : placeholder,
    isLoaded,
    isInView,
    ref: imgRef,
    onLoad: handleLoad,
    onError: handleError,
    setCurrentSrc
  };
};

/**
 * Higher-order component for lazy loading components
 * @param {Function} importFunc - Dynamic import function
 * @param {React.Component} LoadingComponent - Component to show while loading
 * @param {React.Component} ErrorComponent - Component to show on error
 */
export const withLazyLoading = (
  importFunc,
  LoadingComponent = null,
  ErrorComponent = null
) => {
  return function LazyComponent(props) {
    const {
      component: Component,
      isLoading,
      error
    } = useLazyComponent(importFunc);

    if (error && ErrorComponent) {
      return <ErrorComponent error={error} {...props} />;
    }

    if (isLoading && LoadingComponent) {
      return <LoadingComponent {...props} />;
    }

    if (Component) {
      return <Component {...props} />;
    }

    return LoadingComponent ? <LoadingComponent {...props} /> : null;
  };
};

/**
 * Component for lazy loading images with placeholder
 * @param {Object} props - Image props
 */
export const LazyImage = ({
  src,
  alt = "",
  className = "",
  placeholder = null,
  fallbackSrc = null,
  ...imgProps
}) => {
  const { imageSrc, isLoaded, ref, onLoad, onError, setCurrentSrc } =
    useLazyImage(src);

  const handleError = () => {
    onError();
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
  };

  return (
    <div ref={ref} className={`lazy-image-container ${className}`}>
      {!isLoaded && placeholder && (
        <div className='lazy-image-placeholder'>{placeholder}</div>
      )}
      <img
        {...imgProps}
        src={imageSrc}
        alt={alt}
        onLoad={onLoad}
        onError={handleError}
        className={`lazy-image ${isLoaded ? "loaded" : "loading"} ${className}`}
        loading='lazy'
        decoding='async'
      />
    </div>
  );
};

export default useLazyImage;
