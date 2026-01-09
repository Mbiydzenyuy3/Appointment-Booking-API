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
    const isPublicAuthEndpoint =
      config.url.startsWith("/auth/") ||
      config.url === "/services" ||
      config.url.startsWith("/slots/search/available") ||
      config.url.startsWith("/providers");

    if (!isPublicAuthEndpoint) {
      const token = sessionStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn(
          "No token found in sessionStorage for request:",
          config.url
        );
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
      sessionStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default api;
