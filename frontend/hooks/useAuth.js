// frontend/hooks/useAuth.js
'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');

      if (token) {
        apiClient.setToken(token);
        const result = await apiClient.getUserProfile();

        if (result.success) {
          setUser(result.data);
        } else {
          localStorage.removeItem('authToken');
          setError(result.error);
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    const result = await apiClient.login(email, password);

    if (result.success) {
      localStorage.setItem('authToken', result.data.token);
      apiClient.setToken(result.data.token);
      setUser(result.data.user);
      return { success: true };
    }

    setError(result.error);
    return { success: false, error: result.error };
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    apiClient.setToken(null);
    setUser(null);
  };

  return { user, loading, error, login, logout, isAuthenticated: !!user };
}
