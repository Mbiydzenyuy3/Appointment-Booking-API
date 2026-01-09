import React from "react";
import { Formik, Form, ErrorMessage, Field } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import SuccessOverlay from "../components/Common/SuccessOverlay.tsx";

const ClientRegisterSchema = Yup.object().shape({
  name: Yup.string().required("Full name is required"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters long")
    .max(30, "Password must be no more than 30 characters long")
    .matches(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*(),.?\":{}|<>_\\-+=\\[\\]\\\\';/]).*$"
      ),
      "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    .required("Password is required"),
  user_type: Yup.string()
    .oneOf(["client", "provider"], "Please select a valid account type")
    .required("Account type is required")
});

export default function ClientRegister() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className='relative flex items-center justify-center bg-blue-50 py-4 px-4 safe-area-bottom'>
      <Link
        to='/register'
        className='absolute left-4 top-4 inline-flex items-center text-blue-600 hover:text-blue-700 font-medium'
      >
        ← Back
      </Link>
      <main
        id='main-content'
        className='bg-white shadow-xl rounded-2xl w-3xl max-w-md p-6 sm:p-8 items-center justify-center'
        role='main'
        aria-labelledby='register-title'
      >
        {success && <SuccessOverlay message='Account created successfully!' />}
        {/* Header */}
        <div className='text-center mb-8 relative'>
          <h1
            className='text-2xl sm:text-3xl font-bold text-gray-900 mb-2'
            id='register-title'
          >
            Join BookEasy
          </h1>
          <p className='text-gray-600'>
            Create your account to book appointments
          </p>
        </div>

        <Formik
          initialValues={{
            name: "",
            email: "",
            password: "",
            user_type: "client"
          }}
          validationSchema={ClientRegisterSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setFormError("");
            const registerData = { ...values };
            const res = await register(registerData);

            if (res.success) {
              setSuccess(true);
              setTimeout(() => {
                if (values.user_type === "provider") {
                  navigate("/provider/dashboard");
                } else {
                  navigate("/dashboard");
                }
              }, 900);
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
                  htmlFor='name'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Full Name
                </label>
                <Field
                  name='name'
                  type='text'
                  placeholder='Enter your full name'
                  className='input-field field w-full touch-target text-gray-700'
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
                  className='input-field field w-full touch-target text-gray-700'
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
                  type={showPassword ? "text" : "password"}
                  placeholder='Password: 8-30 chars, 1 uppercase, 1 lowercase, 1 number, 1 special (!@#$%^&*)'
                  autoComplete='new-password'
                  className='input-field field w-full touch-target text-gray-700'
                />
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='showPassword'
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                    className='mr-2 border-none shadow-none bg-transparent outline-none'
                  />
                  <label
                    htmlFor='showPassword'
                    className='text-sm text-gray-700'
                  >
                    Show password
                  </label>
                </div>
                <ErrorMessage
                  name='password'
                  component='p'
                  className='text-sm text-red-600 mt-1'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Account Type
                </label>
                <div className='space-y-2'>
                  <label className='flex items-center'>
                    <Field
                      type='radio'
                      name='user_type'
                      value='client'
                      className='mr-2'
                    />
                    Client - I want to book services
                  </label>
                  <label className='flex items-center'>
                    <Field
                      type='radio'
                      name='user_type'
                      value='provider'
                      className='mr-2'
                    />
                    Provider - I want to offer services
                  </label>
                </div>
                <ErrorMessage
                  name='user_type'
                  component='p'
                  className='text-sm text-red-600 mt-1'
                />
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
                  "Get Started"
                )}
              </button>

              <div className='text-center'>
                <p className='text-sm text-gray-600'>
                  Already have an account?{" "}
                  <Link
                    to='/login'
                    className='text-blue-600 hover:text-blue-700 font-medium hover:underline touch-target inline-block'
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
