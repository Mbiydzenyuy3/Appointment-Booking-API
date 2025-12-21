import React from "react";
import { LazyWrapper } from "../components/LazyLoading";
import { LazyLoadingSpinner } from "../components/LazyLoading";
import { LazyErrorBoundary } from "../components/LazyLoading";

/**
 * Higher-order component for creating lazy-loaded routes
 * This utility function creates a lazy route component with built-in loading and error states
 */
export const createLazyRoute = (importFunc, options = {}) => {
  const {
    fallback = <LazyLoadingSpinner message='Loading page...' />,
    errorFallback = <LazyErrorBoundary message='Failed to load page' />
  } = options;

  return function LazyRouteComponent(props) {
    return (
      <LazyWrapper
        importFunc={importFunc}
        fallback={fallback}
        errorFallback={errorFallback}
        {...props}
      />
    );
  };
};
