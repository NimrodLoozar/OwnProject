import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Login from "./Login";

const OwnerRoute = ({ children }) => {
  const { isAuthenticated, isOwner } = useAuth();

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return <Login />;
  }

  // If authenticated but not owner, redirect to dashboard
  if (!isOwner()) {
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated and is owner, render the children
  return children;
};

export default OwnerRoute;
