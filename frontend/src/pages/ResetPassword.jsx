import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import api from "../services/api.js";
import PasswordInput from "../components/Common/PasswordInput.jsx";

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Minimum 6 characters")
    .required("password input field is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("confirm password input field is required")
});

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isValidToken, setIsValidToken] = useState(null);

  const token = searchParams.get("token");

  useEffect(() => {
    // Check if token exists
    if (!token) {
      setIsValidToken(false);
      return;
    }

    // In a real implementation, you might want to validate the token here
    // For now, we'll assume it's valid if it exists
    setIsValidToken(true);
  }, [token]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await api.post("/auth/reset-password", {
        token,
        newPassword: values.password
      });

      if (response.data.success) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      throw error; // Let Formik handle the error
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state while checking token
  if (isValidToken === null) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-green-200'>
        <div className='loading-spinner'></div>
      </div>
    );
  }

  // Invalid token state
  if (isValidToken === false) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-green-200 py-6 px-4 safe-area-bottom'>
        <main
          id='main-content'
          className='bg-white shadow-xl rounded-2xl w-full max-w-md p-6 sm:p-8 justify-center items-center'
          role='main'
          aria-labelledby='invalid-link-title'
        >
          {/* Header */}
          <div className='text-center mb-8'>
            <Link
              to='/'
              className='inline-flex items-center space-x-2 text-2xl font-bold text-green-800 mb-4'
            >
              <span className='text-3xl'>📅</span>
              <span>BOOKEasy</span>
            </Link>
            <h1
              className='text-2xl sm:text-3xl font-bold text-gray-900 mb-2'
              id='invalid-link-title'
            >
              Invalid reset link
            </h1>
            <p className='text-gray-600'>
              This password reset link is invalid or has expired
            </p>
          </div>

          {/* Error Icon */}
          <div className='mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 mb-6'>
            <svg
              className='h-8 w-8 text-red-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </div>

          {/* Action Buttons */}
          <div className='space-y-4'>
            <Link
              to='/forgot-password'
              className='w-full btn btn-primary py-3 text-base font-semibold touch-target'
            >
              Request new reset link
            </Link>

            <Link
              to='/login'
              className='w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
            >
              Back to login
            </Link>
          </div>

          {/* Additional info */}
          <div className='mt-8 pt-6 border-t border-gray-200'>
            <p className='text-xs text-gray-500 text-center'>
              Need help? Contact our support team
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Valid token - show reset form
  return (
    <div className='min-h-screen flex items-center justify-center bg-green-200 py-6 px-4 safe-area-bottom'>
      <main
        id='main-content'
        className='bg-white shadow-xl rounded-2xl w-full max-w-md p-6 sm:p-8 justify-center items-center'
        role='main'
        aria-labelledby='reset-password-title'
      >
        {/* Header */}
        <div className='text-center mb-8'>
          <Link
            to='/'
            className='inline-flex items-center space-x-2 text-2xl font-bold text-green-800 mb-4'
          >
            <span className='text-3xl'>📅</span>
            <span>BOOKEasy</span>
          </Link>
          <h1
            className='text-2xl sm:text-3xl font-bold text-gray-900 mb-2'
            id='reset-password-title'
          >
            Reset your password
          </h1>
          <p className='text-gray-600'>Enter your new password below</p>
        </div>

        <Formik
          initialValues={{ password: "", confirmPassword: "" }}
          validationSchema={ResetPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className='space-y-6'>
              <div>
                <PasswordInput
                  name='password'
                  label='New Password'
                  placeholder='Enter new password'
                  autoComplete='new-password'
                  showPasswordRequirements={true}
                  error={
                    <ErrorMessage
                      name='password'
                      component='p'
                      className='text-sm text-red-600 mt-1'
                    />
                  }
                />
              </div>

              <div>
                <PasswordInput
                  name='confirmPassword'
                  label='Confirm New Password'
                  placeholder='Confirm new password'
                  autoComplete='new-password'
                  error={
                    <ErrorMessage
                      name='confirmPassword'
                      component='p'
                      className='text-sm text-red-600 mt-1'
                    />
                  }
                />
              </div>

              <button
                type='submit'
                disabled={isSubmitting}
                className='btn btn-primary w-full py-4 text-base font-semibold touch-target disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isSubmitting ? (
                  <div className='flex items-center justify-center'>
                    <div className='loading-spinner mr-2'></div>
                    Resetting...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </button>

              <div className='text-center'>
                <Link
                  to='/login'
                  className='text-sm text-green-600 hover:text-green-700 font-medium hover:underline touch-target inline-block'
                >
                  ← Back to login
                </Link>
              </div>
            </Form>
          )}
        </Formik>

        {/* Additional info */}
        <div className='mt-8 pt-6 border-t border-gray-200'>
          <p className='text-xs text-gray-500 text-center'>
            Password must be at least 6 characters long
          </p>
        </div>
      </main>
    </div>
  );
}
