import { Navigate } from "react-router-dom";

// 🔒 For protected pages that require authentication
export const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("userDetails") || "{}");

  if (!token) return <Navigate to="/login" replace />;

  if (user?.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 🚀 Guest-only routes (redirects authenticated users)
export const GuestOnly = ({ children }) => {
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("userDetails") || "{}");

  if (token && user?.role === "ADMIN") {
    return <Navigate to="/superAdmin" replace />;
  }

  return children;
};
