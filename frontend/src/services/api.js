import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json"
  }
});

// Added a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    // Skip adding token for public auth endpoints
    const publicAuthEndpoints = [
      "/auth/login",
      "/auth/register",
      "/auth/forgot-password",
      "/auth/reset-password",
      "/auth/google-auth"
    ];

    const isPublicAuthEndpoint = publicAuthEndpoints.some((endpoint) =>
      config.url.includes(endpoint)
    );

    if (!isPublicAuthEndpoint) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn("No token found in localStorage for request:", config.url);
      }
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Added a response interceptor to handle 401 errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error(
        "401 Unauthorized - clearing token and redirecting to login"
      );
      localStorage.removeItem("token");
      // Optionally redirect to login page
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
