import axios from "axios";

// Define API base URL with fallback
// Using proxy configured in vite.config.js
const API_BASE_URL = "/api";

console.log("API Base URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Add timeout to prevent hanging requests
  timeout: 15000,
  // Add retry logic
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Only reject if server error
  }
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Log request details in development
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  },
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response status in development
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Log detailed error information
    if (error.response) {
      console.error("API Error Response:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url,
        method: error.config.method,
      });
    } else if (error.request) {
      console.error("API No Response:", {
        request: error.request,
        url: error.config?.url,
        method: error.config?.method,
      });
    } else {
      console.error("API Error:", error.message);
    }
    return Promise.reject(error);
  },
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear token and redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
