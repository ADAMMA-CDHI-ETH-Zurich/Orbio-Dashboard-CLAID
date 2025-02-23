import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { useAuth } from "../provider/authProvider";
import { ProtectedRoute } from "./ProtectedRoute";
import { UserTypeRoute } from "./UserTypeRoute";

import ConfigPage from "../Pages/ConfigPage";
import LoginPage from "../Pages/LoginPage";
import NotFound from "../Pages/NotFound";
import SignUpPage from "../Pages/SignupPage";
import PI from "../Pages/pi/PI";
import User from "../Pages/user/User";

/**
 * Defines authenticated and non-authenticated routes.
 * For instance, root `/` page will direct to Login for non-authenticated clients, `/pi` for logged-in PIs, and `/user` for logged-in Users.
 * Subpages are handled through overall `PI` and `User` components.
 */
const Routes = () => {
  const { token, userId } = useAuth();

  // Define public routes accessible to all users
  const routesForPublic = [
    {
      path: "*", // Fallback
      element: <NotFound />,
    },
  ];

  // Define routes accessible only to authenticated users
  const routesForAuthenticatedOnly = [
    {
      path: "/",
      element: <ProtectedRoute />,
      children: [
        {
          path: "",
          element: userId === "principal_investigator" ? (
            <Navigate to="/pi" replace />
          ) : (
            <Navigate to="/user" replace />
          ),
        },
        {
          path: "/signup",
          element: <SignUpPage />,
        },
        {
          path: "/login",
          element: <LoginPage />,
        },
        {
          path: "/user/*",
          element: (
            <UserTypeRoute allowedUserType="user">
              <User />
            </UserTypeRoute>
          ),
        },
        {
          path: "/config",
          element: (
            <UserTypeRoute allowedUserType="user">
              <ConfigPage />
            </UserTypeRoute>
          ),
        },
        {
          path: "/pi/*",
          element: (
            <UserTypeRoute allowedUserType="principal_investigator">
              <PI />
            </UserTypeRoute>
          ),
        },
      ],
    },
  ];

  // Define routes accessible only to non-authenticated users
  const routesForNotAuthenticatedOnly = [
    {
      path: "/",
      element: <LoginPage />,
    },
    {
        path: "/signup" ,
        element: <SignUpPage />,
    },
    {
        path: "/login" ,
        element: <LoginPage />,
    },
  ];

  // Combine and conditionally include routes based on authentication status
  const router = createBrowserRouter([
    // ...routesForPublic,
    ...(!token ? routesForNotAuthenticatedOnly : []),
    ...routesForAuthenticatedOnly,
    ...routesForPublic
  ]);

  // Provide the router configuration using RouterProvider
  return <RouterProvider router={router} />;
};

export default Routes;