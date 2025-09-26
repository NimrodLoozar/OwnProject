import React, { createContext, useContext, useState, useEffect } from "react";

// Create the authentication context
const AuthContext = createContext();

// API base URL
const API_BASE_URL = "http://192.168.1.92:8000/api";

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userDeleted, setUserDeleted] = useState(false);

  // Check if user is already authenticated on component mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Periodically check if user still exists (every 30 seconds)
  useEffect(() => {
    if (isAuthenticated && user) {
      const interval = setInterval(async () => {
        await checkUserExists();
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  // Check if the current user still exists in the database
  const checkUserExists = async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/users/${user.id}/exists`
      );
      if (response.ok) {
        const data = await response.json();
        if (!data.exists) {
          // User has been deleted
          setUserDeleted(true);
          logout();
        }
      }
    } catch (error) {
      console.error("Error checking user existence:", error);
    }
  };

  // Validate existing token and get user info
  const validateToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setIsAuthenticated(true);
        setUser(userData);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem("access_token");
      }
    } catch (error) {
      console.error("Token validation failed:", error);
      localStorage.removeItem("access_token");
    } finally {
      setLoading(false);
    }
  };

  // Login function with real API call
  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.access_token;

        // Store token in localStorage
        localStorage.setItem("access_token", token);

        // Get user information
        const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setIsAuthenticated(true);
          setUser(userData);
          return { success: true, message: "Login successful" };
        } else {
          throw new Error("Failed to get user information");
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error.message || "Login failed");
    }
  };

  // Register function
  const register = async (username, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        return { success: true, message: "Registration successful" };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error(error.message || "Registration failed");
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local state and token
      localStorage.removeItem("access_token");
      setIsAuthenticated(false);
      setUser(null);
      setUserDeleted(false);
    }
  };

  // Check if user has owner role
  const isOwner = () => {
    return user && user.role === "owner";
  };

  // API call helper with authentication
  const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem("access_token");
    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token expired or invalid
      logout();
      throw new Error("Authentication expired. Please login again.");
    }

    return response;
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    userDeleted,
    isOwner,
    login,
    register,
    logout,
    apiCall,
    checkUserExists,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
