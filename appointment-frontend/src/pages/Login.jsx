// src/pages/Login.jsx
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import apiFetch from "../services/api.js";

// Validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please provide a valid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function Login() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md p-6 rounded w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              setFormError(""); // Clear previous error
              const res = await apiFetch("/auth/login", {
                method: "POST",
                data: JSON.stringify(values),
              });
              localStorage.setItem("token", res.token);

              if (res.user?.user_type === "provider") {
                navigate("/provider/dashboard");
              } else {
                navigate("/dashboard");
              }
            } catch (err) {
              setFormError(
                err.response?.data?.message || "Login failed. Please try again."
              );
            } finally {
              setSubmitting(false);
            }
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
                autoComplete="email"
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
                autoComplete="current-password"
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
