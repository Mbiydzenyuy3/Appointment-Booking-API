import React, { useEffect, useRef } from "react";

export default function GoogleButton({ onReady }) {
  const ref = useRef(null);

  useEffect(() => {
    if (window.google && ref.current) {
      window.google.accounts.id.renderButton(ref.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        width: 320
      });
      onReady?.();
    }
  }, [onReady]);

  return (
    <div
      ref={ref}
      className='w-full flex justify-center items-center [&_div]:w-full [&_iframe]:w-full'
      aria-label='Continue with Google'
    />
  );
}
