import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import PasswordInput from "../components/Common/PasswordInput.jsx";
import SuccessOverlay from "../components/Common/SuccessOverlay.jsx";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required")
});

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);

  return (
    <div className='relative min-h-screen flex items-center justify-center bg-green-50 py-6 px-4'>
      <Link to='/' className='absolute left-4 top-4 text-green-600 font-medium'>
        ← Back
      </Link>
      <main
        className='relative bg-white shadow-xl rounded-2xl w-full max-w-md p-6 sm:p-8'
        aria-labelledby='login-title'
      >
        {success && <SuccessOverlay message='Welcome back!' />}

        {/* Header */}
        <div className='text-center mb-8 relative'>
          <h1
            id='login-title'
            className='text-2xl sm:text-3xl font-bold text-gray-900'
          >
            Welcome Back
          </h1>
          <p className='text-gray-600 mt-1'>Sign in to manage your business</p>
        </div>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setFormError("");
            const res = await login(values.email, values.password);

            if (res.success) {
              setSuccess(true);
              setTimeout(() => {
                if (res.user_type === "provider")
                  navigate("/provider/dashboard");
                else navigate("/dashboard");
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
                <div className='bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 text-center'>
                  {formError}
                </div>
              )}

              <div>
                <label className='label text-gray-800'>Email Address</label>
                <Field
                  name='email'
                  type='email'
                  className='input-field w-full border border-gray-300 text-gray-500'
                  placeholder='you@example.com'
                />
                <ErrorMessage
                  name='email'
                  component='p'
                  className='error-text'
                />
              </div>

              <PasswordInput
                name='password'
                label='Password'
                placeholder='Enter your password'
              />

              <button
                type='submit'
                disabled={isSubmitting}
                className='btn btn-primary w-full py-4'
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>

              <div className='text-center space-y-2'>
                <p className='text-sm text-gray-600'>
                  Don’t have an account?{" "}
                  <Link to='/register' className='text-green-600 font-medium'>
                    Create Account
                  </Link>
                </p>
              </div>
            </Form>
          )}
        </Formik>

        <p className='text-xs text-gray-500 text-center mt-6'>
          By signing in, you agree to our Terms & Privacy Policy
        </p>
      </main>
    </div>
  );
}
