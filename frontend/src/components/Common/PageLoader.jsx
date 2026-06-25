import React from "react";

/**
 * A lightweight, branded loading spinner shown while lazy-loaded pages
 * are being fetched. Uses pure CSS animation — no external dependencies.
 */
const PageLoader = () => {
  return (
    <div
      role='status'
      aria-label='Loading page'
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#f8fafc",
        gap: "1rem"
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid #dcf2dc",
          borderTopColor: "#369936",
          borderRadius: "50%",
          animation: "page-loader-spin 0.6s linear infinite"
        }}
      />
      <span
        style={{
          color: "#369936",
          fontSize: "0.875rem",
          fontWeight: 500,
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
          letterSpacing: "0.02em"
        }}
      >
        Loading…
      </span>
      <style>{`
        @keyframes page-loader-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PageLoader;
