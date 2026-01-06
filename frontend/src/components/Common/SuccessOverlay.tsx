import React from "react";

interface SuccessOverlayProps {
  message: string;
}

export default function SuccessOverlay({ message }: SuccessOverlayProps) {
  return (
    <div
      className='absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 animate-fade-in'
      role='status'
      aria-live='polite'
    >
      <div className='w-12 h-12 rounded-full border-4 border-green-600 border-t-transparent animate-spin mb-4'></div>
      <p className='text-green-700 font-medium text-lg text-center'>
        {message}
      </p>
      <p className='text-sm text-gray-500 mt-1'>Redirecting…</p>
    </div>
  );
}
