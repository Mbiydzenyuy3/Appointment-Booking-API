import React, { useEffect } from "react";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useGoogleAuth } from "../hooks/useGoogleAuth.js";
// import GoogleAuthDebugger from "../components/Providers/GoogleAuthDebugger.jsx";

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email")
    .required("email input field is required"),
  password: Yup.string().required("password input field is required")
});

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { initializeGoogleAuth, isInitialized } = useGoogleAuth();
  const [formError, setFormError] = useState("");
  const [googleButtonRendered, setGoogleButtonRendered] = useState(false);

  // Initialize Google OAuth when component mounts
  useEffect(() => {
    initializeGoogleAuth();
  }, [initializeGoogleAuth]);

  // Render Google button when Google SDK is loaded and initialized
  useEffect(() => {
    if (isInitialized && !googleButtonRendered) {
      const buttonContainer = document.getElementById("google-signin-button");
      if (buttonContainer && window.google) {
        try {
          window.google.accounts.id.renderButton(buttonContainer, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "continue_with",
            locale: "en"
          });
          setGoogleButtonRendered(true);
          console.log("Google button rendered successfully");
        } catch (error) {
          console.error("Error rendering Google button:", error);
        }
      }
    }
  }, [isInitialized, googleButtonRendered]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-green-200 py-6 px-4 safe-area-bottom'>
      <main
        id='main-content'
        className='bg-white shadow-xl rounded-2xl w-full max-w-md p-6 sm:p-8 justify-center items-center'
        role='main'
        aria-labelledby='login-title'
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
            id='login-title'
          >
            Welcome Back
          </h1>
          <p className='text-gray-600'>Sign in to your account to continue</p>
        </div>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setFormError("");
            const res = await login(values.email, values.password);
            if (res.success) {
              if (res.user_type === "provider") navigate("/provider/dashboard");
              else navigate("/dashboard");
            } else {
              setFormError(res.message);
            }
            setSubmitting(false);
          }}
        >
          {({ isSubmitting }) => (
            <Form className='space-y-6'>
              {formError && (
                <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                  <p className='text-sm text-red-700 text-center flex items-center justify-center'>
                    <svg
                      className='w-4 h-4 mr-2'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                        clipRule='evenodd'
                      />
                    </svg>
                    {formError}
                  </p>
                </div>
              )}

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

              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Password
                </label>
                <Field
                  name='password'
                  type='password'
                  placeholder='Enter your password'
                  className='input-field w-full touch-target text-gray-800'
                  autoComplete='current-password'
                />
                <ErrorMessage
                  name='password'
                  component='p'
                  className='text-sm text-red-600 mt-1'
                />
              </div>

              {/* Google OAuth Button */}
              <div className='w-full'>
                <div id='google-signin-button' className='w-full'></div>
              </div>

              {/* Divider */}
              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-gray-300' />
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-2 bg-white text-gray-500'>Or</span>
                </div>
              </div>

              {/* Email/Password Login Button */}
              <button
                type='submit'
                disabled={isSubmitting}
                className='btn btn-primary w-full py-4 text-base font-semibold touch-target disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isSubmitting ? (
                  <div className='flex items-center justify-center'>
                    <div className='loading-spinner mr-2'></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In with Email"
                )}
              </button>

              <div className='text-center space-y-3'>
                <p className='text-sm text-gray-600'>
                  Don't have an account?{" "}
                  <Link
                    to='/register'
                    className='text-green-600 hover:text-green-700 font-medium hover:underline touch-target inline-block'
                  >
                    Create Account
                  </Link>
                </p>

                <Link
                  to='/forgot-password'
                  className='text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline touch-target inline-block'
                >
                  Forgot your password?
                </Link>
              </div>
            </Form>
          )}
        </Formik>

        {/* Additional info */}
        <div className='mt-8 pt-6 border-t border-gray-200'>
          <p className='text-xs text-gray-500 text-center'>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </main>

      {/* Debug Section - Remove in production */}
      {/* <div className='max-w-md mx-auto mt-6'>
        <GoogleAuthDebugger />
      </div> */}
    </div>
  );
}
