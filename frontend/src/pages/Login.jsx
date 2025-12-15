// src/pages/Login.jsx
import React from "react";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().required("Required"),
});

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formError, setFormError] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md p-6 rounded w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
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
            <Form className="space-y-4">
              {formError && (
                <p className="text-sm text-red-500 text-center">{formError}</p>
              )}
              <Field
                name="email"
                type="email"
                placeholder="Email"
                className="input w-full"
              />
              <ErrorMessage
                name="email"
                component="p"
                className="text-sm text-red-500"
              />

              <Field
                name="password"
                type="password"
                placeholder="Password"
                className="input w-full"
              />
              <ErrorMessage
                name="password"
                component="p"
                className="text-sm text-red-500"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
              <p className="text-sm text-center">
                Don’t have an account?{" "}
                <Link to="/register" className="text-blue-600 hover:underline">
                  Register
                </Link>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
