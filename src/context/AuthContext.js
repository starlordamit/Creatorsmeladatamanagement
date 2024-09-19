"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { fetchUserProfile } from "@/services/api";

// Create the AuthContext
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // State to store user info
  const [authToken, setAuthToken] = useState(null); // State to store token
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthToken(token);
      fetchUserProfile(token)
        .then((data) => setUser(data))
        .catch(() => {
          setUser(null);
          localStorage.removeItem("authToken"); // Clear invalid token
        });
    }
  }, []);

  // Login function
  const login = (token) => {
    setAuthToken(token);
    localStorage.setItem("authToken", token);
    fetchUserProfile(token)
      .then((data) => {
        setUser(data); // Set user data after login
        router.push("/dashboard"); // Redirect to dashboard after login
      })
      .catch(() => {
        setAuthToken(null);
        localStorage.removeItem("authToken");
        setUser(null);
        console.error("Failed to fetch user profile after login");
      });
  };

  // Logout function
  const logout = () => {
    setAuthToken(null);
    localStorage.removeItem("authToken");
    setUser(null); // Reset user on logout
    router.push("/auth/Login"); // Redirect to login after logout
  };

  return (
    <AuthContext.Provider value={{ user, setUser, authToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
