import React from "react";
import { useAuth } from "../contexts/AuthContext";
import Login from "../components/Login";
import Dashboard from "./Dashboard";

function HomePage() {
  const { isAuthenticated } = useAuth();

  // Show login form if not authenticated, otherwise show dashboard
  return isAuthenticated ? <Dashboard /> : <Login />;
}

export default HomePage;
