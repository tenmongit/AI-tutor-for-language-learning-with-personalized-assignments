import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      api
        .get("/auth/me")
        .then((response) => {
          setCurrentUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem("token");
          delete api.defaults.headers.common["Authorization"];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setCurrentUser(user);
      return user;
    } catch (error) {
      throw error.response?.data?.message || "Failed to login";
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log("Attempting to register with:", { name, email });
      
      // Ensure API base URL is correctly set
      console.log("API base URL:", api.defaults.baseURL);
      
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      
      console.log("Registration response:", response.data);
      
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error("Registration error details:", error);
      
      // Provide more detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Server response error:", {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers,
        });
        throw error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        throw "No response from server. Please check your internet connection and try again.";
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Request setup error:", error.message);
        throw error.message || "Failed to register";
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setCurrentUser(null);
    navigate("/login");
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
