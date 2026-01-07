import React, { useState } from "react";
import { Field, ErrorMessage, useField } from "formik";

export default function PasswordInput({
  name,
  label,
  placeholder,
  autoComplete = "current-password",
  required = false
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [field] = useField(name);

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
            w-full pl-10 py-2.5
            border border-gray-200 rounded-md
            bg-gray-50/30 text-gray-800
            placeholder:text-gray-400

          '
        />
      </div>

      <div className='flex items-center mt-2'>
        <input
          type='checkbox'
          id={`${name}-show`}
          checked={showPassword}
          onChange={() => setShowPassword((prev) => !prev)}
          className='mr-2 border-none shadow-none bg-transparent outline-none'
        />
        <label htmlFor={`${name}-show`} className='text-sm text-gray-700'>
          Show password
        </label>
      </div>

      <ErrorMessage
        name={name}
        component='p'
        className='text-[11px] text-red-500 mt-1'
      />
    </div>
  );
}
