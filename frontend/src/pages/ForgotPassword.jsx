import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import api from "../services/api.js";

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email")
    .required("email input field is required")
});

export default function ForgotPassword() {
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await api.post("/auth/forgot-password", {
        email: values.email
      });

      if (response.data.success) {
        setEmailSent(true);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error; // Let Formik handle the error
    } finally {
      setSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-green-200 py-6 px-4 safe-area-bottom'>
        <main
          id='main-content'
          className='bg-white shadow-xl rounded-2xl w-full max-w-md p-6 sm:p-8 justify-center items-center'
          role='main'
          aria-labelledby='email-sent-title'
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
              id='email-sent-title'
            >
              Check your email
            </h1>
            <p className='text-gray-600'>
              We've sent a password reset link to your email
            </p>
          </div>

          {/* Success Icon */}
          <div className='mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 mb-6'>
            <svg
              className='h-8 w-8 text-green-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
          </div>

          {/* Action Buttons */}
          <div className='space-y-4'>
            <button
              onClick={() => {
                setEmailSent(false);
              }}
              className='w-full btn btn-primary py-3 text-base font-semibold touch-target'
            >
              Send another email
            </button>

            <Link
              to='/login'
              className='w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
            >
              Back to Login
            </Link>
          </div>

          {/* Additional info */}
          <div className='mt-8 pt-6 border-t border-gray-200'>
            <p className='text-xs text-gray-500 text-center'>
              Didn't receive the email? Check your spam folder
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-green-200 py-6 px-4 safe-area-bottom'>
      <main
        id='main-content'
        className='bg-white shadow-xl rounded-2xl w-full max-w-md p-6 sm:p-8 justify-center items-center'
        role='main'
        aria-labelledby='forgot-password-title'
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
            id='forgot-password-title'
          >
            Forgot your password?
          </h1>
          <p className='text-gray-600'>
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <Formik
          initialValues={{ email: "" }}
          validationSchema={ForgotPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className='space-y-6'>
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Email Address
                </label>
                <Field
                  name='email'
                  type='email'
                  placeholder='Enter your email'
                  className='input-field w-full touch-target text-gray-700'
                  autoComplete='email'
                />
                <ErrorMessage
                  name='email'
                  component='p'
                  className='text-sm text-red-600 mt-1'
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
                    Sending...
                  </div>
                ) : (
                  "Send reset link"
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
            Remember your password? Sign in to your account
          </p>
        </div>
      </main>
    </div>
  );
}
