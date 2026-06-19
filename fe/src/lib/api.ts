import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001",
  withCredentials: true, // Enables automatic cookie handling for cross-origin requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor to format error messages
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error.response &&
      error.response.data &&
      typeof error.response.data === "object" &&
      "message" in error.response.data
    ) {
      // Propagate the backend's error message
      error.message = error.response.data.message || error.message;
    }
    return Promise.reject(error);
  },
);

export default api;
