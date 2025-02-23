import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../provider/authProvider";

/**
 * Checks if user is authenticated and, if not, navigates to root page.
 */
export const ProtectedRoute = () => {
    const { token } = useAuth();
  
    // Check if the user is authenticated
    if (!token) {
      // If not authenticated, redirect to the welcome page
      return <Navigate to="/" />;
    }
  
    // If authenticated, render the child routes
    return <Outlet />;
  };