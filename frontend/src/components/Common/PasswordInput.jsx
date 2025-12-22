import React, { useState } from "react";
import { Field } from "formik";

/**
 * PasswordInput component with visibility toggle functionality
 * Integrates with Formik's Field component for form handling
 */
export default function PasswordInput({
  name,
  label,
  placeholder,
  className = "",
  autoComplete = "current-password",
  required = false,
  error,
  showPasswordRequirements = false,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className='password-input-container'>
      <label
        htmlFor={name}
        className='block text-sm font-medium text-gray-700 mb-2'
      >
        {label}
        {required && <span className='text-red-500 ml-1'>*</span>}
      </label>

      <div className='relative'>
        <Field
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className={`input-field w-full touch-target text-gray-700 pr-10 ${className}`}
          autoComplete={autoComplete}
          {...props}
        />

        {/* Password visibility toggle button */}
        <button
          type='button'
          onClick={togglePasswordVisibility}
          className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors'
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          tabIndex={0}
        >
          {showPassword ? (
            // Eye-off icon (hidden)
            <svg
              className='h-5 w-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21'
              />
            </svg>
          ) : (
            // Eye icon (visible)
            <svg
              className='h-5 w-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
              />
            </svg>
          )}
        </button>
      </div>

      {/* Error message */}
      {error && <p className='text-sm text-red-600 mt-1'>{error}</p>}

      {/* Password requirements helper text */}
      {showPasswordRequirements && (
        <p className='text-xs text-gray-500 mt-1'>
          Password must be at least 6 characters long
        </p>
      )}
    </div>
  );
}
