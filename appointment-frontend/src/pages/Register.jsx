import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import apiFetch from "../services/api.js";

// Validation schema
const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Name should have at least 3 characters")
    .max(30, "Name should have at most 30 characters")
    .required("Name is required"),
  email: Yup.string()
    .email("Please provide a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .matches(/^[a-zA-Z0-9]{6,30}$/, {
      message: "Password must be alphanumeric and between 6 and 30 characters",
    })
    .required("Password is required"),
  user_type: Yup.string()
    .oneOf(["client", "provider"], "Invalid user type")
    .required("User type is required"),
});

const initialValues = {
  name: "",
  email: "",
  password: "",
  user_type: "client",
};

const inputClass = "input w-full";

export default function Register() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState("");

  const handleSubmit = async (values, { setSubmitting }) => {
    const payload = { ...values };

    try {
      setFormError("");
      await apiFetch.post("/auth/register", payload);
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err.response?.data || err);

      if (err.response?.data?.errors) {
        console.log("Server-side validation errors:", err.response.data.errors);
      }

      setFormError(
        err.response?.data?.errors?.[0] ||
          err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md p-6 rounded w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Register</h2>

        <Formik
          initialValues={initialValues}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              {formError && (
                <p className="text-sm text-red-500 text-center">{formError}</p>
              )}

              <Field name="name" placeholder="Name" className={inputClass} />
              <ErrorMessage
                name="name"
                component="p"
                className="text-sm text-red-500"
              />

              <Field
                name="email"
                type="email"
                placeholder="Email"
                className={inputClass}
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
                className={inputClass}
              />
              <ErrorMessage
                name="password"
                component="p"
                className="text-sm text-red-500"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <Field
                  as="select"
                  name="user_type"
                  className={`${inputClass} mt-1`}
                >
                  <option value="client">Client</option>
                  <option value="provider">Provider</option>
                </Field>
                <ErrorMessage
                  name="user_type"
                  component="p"
                  className="text-sm text-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
              >
                {isSubmitting ? "Registering..." : "Register"}
              </button>

              <p className="text-sm text-center">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:underline">
                  Login
                </Link>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
