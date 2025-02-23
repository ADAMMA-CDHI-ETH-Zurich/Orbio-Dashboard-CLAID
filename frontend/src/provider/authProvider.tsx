import { createContext, useContext, useEffect, useState } from "react";

import axios from "axios";
const AuthContext = createContext<{
  token: string | null;
  setToken: (newToken?: string) => void;
  userId: string | null;
  setUserId: (newUserId?: string) => void;
  name: string | null;
  setName: (newName?: string) => void;
}>({
  token: null,
  setToken: () => {},
  userId: null,
  setUserId: () => {},
  name: null,
  setName: () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken_] = useState(localStorage.getItem("token"));
  const [userId, setUserId_] = useState(localStorage.getItem("userId"));
  const [name, setName_] = useState(localStorage.getItem("name"));
  // Handle storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        setToken_(e.newValue);
      }
      if (e.key === "userId") {
        setUserId_(e.newValue);
      }
      if (e.key === "name") {
        setName_(e.newValue);
      }
      // If token is removed (logout), clear all auth data
      if (e.key === "token" && !e.newValue) {
        setToken_(null);
        setUserId_(null);
        setName_(null);
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("name");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Wrapper functions to update both state and localStorage
  const setToken = (newToken?: string) => {
    if (newToken) {
      axios.defaults.headers.common["Authorization"] = "Bearer " + newToken;
      localStorage.setItem("token", newToken);
      setToken_(newToken);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("name");
      setToken_(null);
      setUserId_(null);
      setName_(null);
    }
  };
const logout = () => {
  setToken_(null);
  setUserId_(null);
  setName_(null);
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("name");
}
  // Previous suggestion included:
useEffect(() => {
  const checkTokenExpiration = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          alert("Token has expired. Please log in again");
          logout();
        }
      } catch (e) {
        logout();
      }
    }
  };
  checkTokenExpiration();
  const interval = setInterval(checkTokenExpiration, 60000);
  return () => clearInterval(interval);
}, []);

  const setUserId = (newUserId?: string) => {
    if (newUserId) {
      localStorage.setItem("userId", newUserId);
      setUserId_(newUserId);
    } else {
      localStorage.removeItem("userId");
      setUserId_(null);
    }
  };

  const setName = (newName?: string) => {
    if (newName) {
      localStorage.setItem("name", newName);
      setName_(newName);
    } else {
      localStorage.removeItem("name");
      setName_(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        userId,
        setUserId,
        name,
        setName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 