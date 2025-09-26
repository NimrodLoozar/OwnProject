import React from "react";
import { useAuth } from "../contexts/AuthContext";
import Login from "./Login";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // If not authenticated, show login form
  return isAuthenticated ? children : <Login />;
};

export default ProtectedRoute;
