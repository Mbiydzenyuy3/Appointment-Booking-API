import React, { useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useGoogleAuth } from "../hooks/useGoogleAuth.js";

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required("name input field is required"),
  email: Yup.string()
    .email("Invalid email")
    .required("email input field is required"),
  password: Yup.string()
    .min(6, "Minimum 6 characters")
    .required("password input field is required"),
  user_type: Yup.string()
    .oneOf(["client", "provider"], "Invalid role")
    .required("user type input field is equired")
});

export default function Register() {
  const { register } = useAuth();
  const {
    signInWithGoogle,
    isLoading: isGoogleLoading,
    initializeGoogleAuth,
    isInitialized
  } = useGoogleAuth();
  const navigate = useNavigate();
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
        className='bg-white shadow-xl rounded-2xl w-full max-w-md p-6 sm:p-8 items-center justify-center'
        role='main'
        aria-labelledby='register-title'
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
            id='register-title'
          >
            Create Account
          </h1>
          {/* <p className='text-gray-600'>
            Join BOOKEasy to manage your appointments
          </p> */}
        </div>

        <Formik
          initialValues={{
            name: "",
            email: "",
            password: "",
            user_type: "client"
          }}
          validationSchema={RegisterSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setFormError("");
            console.log("Submitting register form:", values);
            const res = await register(values);
            console.log("Register response:", res);

            if (res.success) {
              if (res.user_type === "provider") navigate("/provider/dashboard");
              else navigate("/dashboard");
            } else {
              setFormError(res.message || "Registration failed");
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
                  htmlFor='name'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Full Name
                </label>
                <Field
                  name='name'
                  type='text'
                  placeholder='Enter your full name'
                  className='input-field w-full touch-target text-gray-700'
                  autoComplete='name'
                />
                <ErrorMessage
                  name='name'
                  component='p'
                  className='text-sm text-red-600 mt-1'
                />
              </div>

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
                  placeholder='Create a password'
                  className='input-field w-full touch-target text-gray-700'
                  autoComplete='new-password'
                />
                <ErrorMessage
                  name='password'
                  component='p'
                  className='text-sm text-red-600 mt-1'
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Password must be at least 6 characters long
                </p>
              </div>

              <div>
                <label
                  htmlFor='user_type'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Account Type
                </label>
                <Field
                  as='select'
                  name='user_type'
                  className='input-field w-full touch-target text-gray-700'
                >
                  <option value='client'>Client - Book appointments</option>
                  <option value='provider'>Provider - Manage services</option>
                </Field>
                <ErrorMessage
                  name='user_type'
                  component='p'
                  className='text-sm text-red-600 mt-1'
                />
              </div>

              {/* Google OAuth Button */}
              <div className='space-y-3'>
                <button
                  type='button'
                  onClick={signInWithGoogle}
                  disabled={isGoogleLoading}
                  className='w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isGoogleLoading ? (
                    <div className='flex items-center justify-center'>
                      <div className='loading-spinner mr-2'></div>
                      Creating account...
                    </div>
                  ) : (
                    <>
                      <svg className='w-5 h-5 mr-3' viewBox='0 0 24 24'>
                        <path
                          fill='#4285F4'
                          d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                        />
                        <path
                          fill='#34A853'
                          d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                        />
                        <path
                          fill='#FBBC05'
                          d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                        />
                        <path
                          fill='#EA4335'
                          d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                        />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>

                {/* Google button container */}
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

              {/* Email/Password Registration Button */}
              <button
                type='submit'
                disabled={isSubmitting}
                className='btn btn-primary w-full py-4 text-base font-semibold touch-target disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isSubmitting ? (
                  <div className='flex items-center justify-center'>
                    <div className='loading-spinner mr-2'></div>
                    Creating account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>

              <div className='text-center'>
                <p className='text-sm text-gray-600'>
                  Already have an account?{" "}
                  <Link
                    to='/login'
                    className='text-green-600 hover:text-green-700 font-medium hover:underline touch-target inline-block'
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </Form>
          )}
        </Formik>

        {/* Additional info */}
        <div className='mt-8 pt-6 border-t border-gray-200'>
          <p className='text-xs text-gray-500 text-center'>
            By creating an account, you agree to our Terms of Service and
            Privacy Policy
          </p>
        </div>
      </main>
    </div>
  );
}
