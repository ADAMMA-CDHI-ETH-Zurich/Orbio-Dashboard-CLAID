import { Navigate } from "react-router-dom";
import { useAuth } from "../provider/authProvider";

interface UserTypeRouteProps {
  children: React.ReactNode;
  allowedUserType: "principal_investigator" | "user";
}

/**
 * If userId stored in local storage/authentication manager doesn't match the passed-in `allowedUserType`, reroutes to the
 * correct page for that client based on the authentication context. Otherwise, displays `children`.
 * @param allowedUserType `'principal_investigator'` or `'user'`, depending on currently-logged in user.
 * @param children Element to display for this user
 */
export const UserTypeRoute = ({ children, allowedUserType }: UserTypeRouteProps) => {
  const { userId } = useAuth();

  if (userId !== allowedUserType) {
    return <Navigate to={userId === "principal_investigator" ? "/pi" : "/user"} replace />;
  }

  return <>{children}</>;
}; 