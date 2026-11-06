import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { initSocket, disconnectSocket } from '../services/socket';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('eventx_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile if token exists
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success && res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('eventx_user', JSON.stringify(res.data.user));
          initSocket(res.data.user._id);
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        setToken(null);
        setUser(null);
        localStorage.removeItem('eventx_token');
        localStorage.removeItem('eventx_user');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  // Handle standard email/pass login
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: newToken, user: loggedUser } = res.data;
        setToken(newToken);
        setUser(loggedUser);
        localStorage.setItem('eventx_token', newToken);
        localStorage.setItem('eventx_user', JSON.stringify(loggedUser));
        initSocket(loggedUser._id);
        toast.success(`Welcome back, ${loggedUser.name}!`);
        return { success: true, user: loggedUser };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password.';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Quick Demo Login helper for 1-click role testing
  const demoLogin = async (role = 'student') => {
    const credentials = {
      admin: { email: 'admin@eventx.com', password: 'Admin@123' },
      organizer: { email: 'organizer@eventx.com', password: 'Organizer@123' },
      student: { email: 'student@eventx.com', password: 'Student@123' },
    };

    const cred = credentials[role] || credentials.student;
    return login(cred.email, cred.password);
  };

  // Register new account
  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('eventx_token', newToken);
        localStorage.setItem('eventx_user', JSON.stringify(newUser));
        initSocket(newUser._id);
        toast.success(`Account created! Welcome to EventX, ${newUser.name}.`);
        return { success: true, user: newUser };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('eventx_token');
    localStorage.removeItem('eventx_user');
    disconnectSocket();
    toast.success('Signed out successfully.');
  };

  // Update current user state (e.g. avatar or name update)
  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updatedFields };
      localStorage.setItem('eventx_user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        demoLogin,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

