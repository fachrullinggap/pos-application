"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  // Add a loading state to wait for the check to complete
  const [loading, setLoading] = useState(true);

  // This effect runs once when the app loads to check for a logged-in user
  useEffect(() => {
    try {
      const storedRole = localStorage.getItem('userRole');
      if (storedRole) {
        setUserRole(storedRole);
      }
    } catch (error) {
      console.error("Could not access localStorage", error);
    } finally {
      // We're done checking, so set loading to false
      setLoading(false);
    }
  }, []); // The empty array ensures this runs only once on mount

  const login = (username, password) => {
    const lowerCaseUsername = username.toLowerCase();
    let role = null;
    let success = false;

    if (lowerCaseUsername === 'admin' && password === 'admin123') {
      role = 'admin';
      success = true;
    } else if (lowerCaseUsername === 'cashier' && password === 'cashier123') {
      role = 'cashier';
      success = true;
    }

    if (success) {
      // On successful login, save the role to localStorage
      localStorage.setItem('userRole', role);
      setUserRole(role);
    }
    return success;
  };

  const logout = () => {
    // On logout, remove the role from localStorage
    localStorage.removeItem('userRole');
    setUserRole(null);
  };

  const value = {
    userRole,
    loading, // Provide the loading state to other components
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
