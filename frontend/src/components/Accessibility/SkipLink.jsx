import React from "react";

const SkipLink = ({
  href = "#main-content",
  children = "Skip to main content"
}) => {
  const handleSkip = (e) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <a
      href={href}
      onClick={handleSkip}
      className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-lg z-50 focus-ring'
    >
      {children}
    </a>
  );
};

export default SkipLink;
