import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 30000
});

// Redirect to /login on any 401 that isn't the initial profile check.
// /auth/profile returning 401 on page load just means "not logged in" — handled by AuthContext.
// All other 401s mean the session expired mid-use and the user needs to re-authenticate.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      if (!url.includes("/auth/profile") && !url.includes("/auth/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
