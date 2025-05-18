// src/pages/Login.jsx
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import apiFetch from "../services/api.js";

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please provide a valid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md p-6 rounded w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const res = await apiFetch("/auth/login", {
                method: "POST",
                body: JSON.stringify(values),
              });
              localStorage.setItem("token", res.token);
              navigate("/dashboard");
            } catch (err) {
              alert(
                "Login failed: " + (err.response?.data?.message || err.message)
              );
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
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
                <a href="/register" className="text-blue-600 hover:underline">
                  Register
                </a>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
