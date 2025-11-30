import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import apiService from '../services/apiService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = authService.getToken();
    const savedUser = authService.getUser();
    if (token && savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      // Handle response - API returns token and user at root level
      const token = response.token || response.data?.token;
      const user = response.user || response.data?.user;
      authService.setAuth(token, user);
      setUser(user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.register(userData);
      // If registration returns a token, auto-login the user
      if (response.token && response.user) {
        authService.setAuth(response.token, response.user);
        setUser(response.user);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  const updateUserData = (userData) => {
    authService.updateUser(userData);
    setUser({ ...user, ...userData });
  };

  const isAuthenticated = () => {
    return !!user && authService.isAuthenticated();
  };

  const isAdmin = () => {
    return authService.isAdmin();
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUserData,
    isAuthenticated,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
