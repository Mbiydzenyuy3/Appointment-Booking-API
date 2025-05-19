import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const apiFetch = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token

apiFetch.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiFetch;