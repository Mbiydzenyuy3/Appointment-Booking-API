// src/pages/Register.jsx
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import apiFetch from "../services/api.js";

// Validation schema (matching Joi schema)
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
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
  user_type: Yup.string()
    .oneOf(["client", "provider"], "Invalid user type")
    .required("User type is required"),
  bio: Yup.string().when("user_type", {
    is: "provider",
    then: (schema) => schema.required("Bio is required for providers"),
    otherwise: (schema) => schema.strip(), // Removes bio from payload if not provider
  }),
});

export default function Register() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md p-6 rounded w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Register</h2>
        <Formik
          initialValues={{
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            user_type: "client",
            bio: "",
          }}
          validationSchema={RegisterSchema}
          onSubmit={async (values, { setSubmitting }) => {
            const { confirmPassword, ...payload } = values; // Remove confirmPassword
            try {
              await apiFetch.post("/auth/register", payload);
              navigate("/login");
            } catch (err) {
              console.error(
                "Registration failed: " +
                  (err.response?.data?.message || err.message)
              );
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, values }) => (
            <Form className="space-y-4">
              <Field name="name" placeholder="Name" className="input w-full" />
              <ErrorMessage
                name="name"
                component="p"
                className="text-sm text-red-500"
              />

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

              <Field
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                className="input w-full"
              />
              <ErrorMessage
                name="confirmPassword"
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
                  className="input w-full mt-1"
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

              {values.user_type === "provider" && (
                <>
                  <Field
                    name="bio"
                    as="textarea"
                    placeholder="Provider bio"
                    className="input w-full"
                  />
                  <ErrorMessage
                    name="bio"
                    component="p"
                    className="text-sm text-red-500"
                  />
                </>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
              >
                {isSubmitting ? "Registering..." : "Register"}
              </button>

              <p className="text-sm text-center">
                Already have an account?{" "}
                <a href="/login" className="text-blue-600 hover:underline">
                  Login
                </a>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
