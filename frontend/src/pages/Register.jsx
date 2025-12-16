// src/pages/Register.jsx
import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(6, "Minimum 6 characters").required("Required"),
  user_type: Yup.string()
    .oneOf(["client", "provider"], "Invalid role")
    .required("Required")
});

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState("");

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <main
        id='main-content'
        className='bg-white shadow-md p-6 rounded w-full max-w-md'
        role='main'
        aria-labelledby='register-title'
      >
        <h1 className='text-2xl font-semibold mb-4' id='register-title'>
          Create Your Account
        </h1>
        <h2 className='text-xl font-medium mb-4 text-gray-700'>Sign Up</h2>
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
              navigate("/login");
            } else {
              setFormError(res.message || "Registration failed");
            }

            setSubmitting(false);
          }}
        >
          {({ isSubmitting }) => (
            <Form className='space-y-4'>
              {formError && (
                <p className='text-sm text-red-500 text-center'>{formError}</p>
              )}
              <Field name='name' placeholder='Name' className='input w-full' />
              <ErrorMessage
                name='name'
                component='p'
                className='text-sm text-red-500'
              />

              <Field
                name='email'
                type='email'
                placeholder='Email'
                className='input w-full'
              />
              <ErrorMessage
                name='email'
                component='p'
                className='text-sm text-red-500'
              />

              <Field
                name='password'
                type='password'
                placeholder='Password'
                className='input w-full'
              />
              <ErrorMessage
                name='password'
                component='p'
                className='text-sm text-red-500'
              />

              <Field as='select' name='user_type' className='input w-full'>
                <option value='client'>client</option>
                <option value='provider'>provider</option>
              </Field>
              <ErrorMessage
                name='user_type'
                component='p'
                className='text-sm text-red-500'
              />

              <button
                type='submit'
                disabled={isSubmitting}
                className='w-full btn-primary'
              >
                {isSubmitting ? "Registering..." : "Register"}
              </button>
              <p className='text-sm text-center'>
                Already have an account?{" "}
                <Link
                  to='/login'
                  className='text-primary-600 hover:underline font-medium'
                >
                  Login
                </Link>
              </p>
            </Form>
          )}
        </Formik>
      </main>
    </div>
  );
}
