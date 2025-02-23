import axios from "axios";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  // State to hold the authentication token
  const [token, setToken_] = useState(localStorage.getItem("token"));
  // State to hold the user type
  const [userId, setUserId_] = useState(localStorage.getItem("userId"));
  const [name, setName_] = useState(localStorage.getItem("name"));
  // Function to set the authentication token
  const setToken = (newToken) => {
    setToken_(newToken);
  };

  const setUserId = (newId) => {
    setUserId_(newId);
  };
  const setName = (newName) => {
    setName_(newName);
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
      localStorage.setItem("token", token);
      if (userId) {
        localStorage.setItem("userId", userId.toString());
      }
      if (name) {
        localStorage.setItem("name", name.toString());
      }
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("name");
    }
  }, [token, userId, name]);

  // Memoized value of the authentication context
  const contextValue = useMemo(
    () => ({
      token,
      setToken,
      userId,
      setUserId,
      name,
      setName
    }),
    [token, userId, name]
  );

  // Provide the authentication context to the children components
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;