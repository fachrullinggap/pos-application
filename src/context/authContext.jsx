"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPicture, setUserPicture] = useState("");
  // Add a loading state to wait for the check to complete
  const [loading, setLoading] = useState(true);

  // This effect runs once when the app loads to check for a logged-in user
  useEffect(() => {
    try {
      // const storedRole = localStorage.getItem('userRole');
      // if (storedRole) {
      //   setUserRole(storedRole);
      // }

      const storedToken = localStorage.getItem('userToken');
      if (storedToken) {
        setUserToken(storedToken);
      }

      // Get the string from localStorage
      const userString = localStorage.getItem('userData');

      // First, check if the userString actually exists
      if (userString) {
        // Only parse if the string is not null
        const userData = JSON.parse(userString);

        // Now that we know userData is a valid object, it's safe to access its properties
        if (userData.role) {
          setUserRole(userData.role);
        }
        if (userData.username) {
          setUserName(userData.username);
        }
        if (userData.email) {
          setUserEmail(userData.email);
        }
        if (userData.userId) {
          setUserId(userData.userId);
        }
        if (userData.userPicture) {
          setUserPicture(userData.userPicture);
        }
      }

    } catch (error) {
      console.error("Could not access localStorage", error);
    } finally {
      // We're done checking, so set loading to false
      setLoading(false);
    }
  }, []); // The empty array ensures this runs only once on mount

  const login = async (username, password) => {
    let success = false;

    const formData ={
      username: username,
      password: password,
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const respondData = await response.json();

      if (response.ok) {
        alert(`Success: ${respondData.message}`);
        success = true;
        
        // On successful login, save the role to localStorage
        localStorage.setItem('userToken', respondData.data.token);
        setUserToken(respondData.data.token);

        const userData = {
          role: respondData.data.role,
          username: respondData.data.username,
          email: respondData.data.email,
          userId: respondData.data.id,
          userPicture: respondData.data.userPicture
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        setUserRole(respondData.data.role);
        setUserName(respondData.data.username);
        setUserEmail(respondData.data.email);
        setUserId(respondData.data.id)
        setUserPicture(respondData.data.userPicture)

      } else {
        alert(`${respondData.message}\n${JSON.stringify(respondData.data)}`);
        success = false;
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while logging in.");
    }
    
    return success;
  };

  const logout = () => {
    // On logout, remove the role from localStorage
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setUserRole(null);
  };

  const updateUserData = (newData) => {
    try {
      // 1. Get the current user data from localStorage
      const existingDataString = localStorage.getItem('userData');
      const existingData = existingDataString ? JSON.parse(existingDataString) : {};

      // 2. Merge the old data with the new data
      const updatedData = { ...existingData, ...newData };

      // 3. Update the state in the context
      if (updatedData.username) {
        setUserName(updatedData.username);
      }
      if (updatedData.email) {
        setUserEmail(updatedData.email);
      }
      if (updatedData.userPicture) {
        setUserPicture(updatedData.userPicture);
      }
      // You can add more fields here if needed (e.g., role)

      // 4. Save the fully updated object back to localStorage
      localStorage.setItem('userData', JSON.stringify(updatedData));

    } catch (error) {
      console.error("Failed to update user data in context/localStorage", error);
    }
  };

  const value = {
    userId,
    userRole,
    userToken,
    userName,
    userEmail,
    userPicture,
    loading, // Provide the loading state to other components
    login,
    logout,
    updateUserData,
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
