import React, { useState } from "react";
import { Field, ErrorMessage, useField } from "formik";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function PasswordInput({
  name,
  label,
  placeholder,
  autoComplete = "current-password",
  required = false
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [field] = useField(name);

  const toggleVisibility = () => setShowPassword((prev) => !prev);

  return (
    <div className='space-y-1.5 w-full'>
      {/* Label and Forgot Password Row */}
      <div className='flex justify-between items-center'>
        <label htmlFor={name} className='block text-sm font-bold text-gray-700'>
          {label}
        </label>
        {/* <button
          type='button'
          className='text-xs font-semibold text-cyan-600 hover:text-cyan-700'
        >
          Forgot password?
        </button> */}
      </div>

      <div
        className='relative flex items-center focus:outline-none
            transition-all'
      >
        <input
          {...field}
          id={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className='
            w-full pl-10 pr-10 py-2.5
            border border-gray-200 rounded-md
            bg-gray-50/30 text-gray-800
            placeholder:text-gray-400
           
          '
        />

        <button
          type='button'
          onClick={toggleVisibility}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className='
            absolute right-2
            text-gray-400 hover:text-gray-600
            focus:outline-none
            flex items-center justify-center
          '
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <ErrorMessage
        name={name}
        component='p'
        className='text-[11px] text-red-500 mt-1'
      />
    </div>
  );
}
