import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!token) {
      setLoading(false);
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }

    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/login', { username, password });

      if (response.data.success) {
        localStorage.setItem('accessToken', response.data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));

        setUser(response.data.data.user);
        return true;
      }
      return false;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const getToken = () => {
    return localStorage.getItem('accessToken');
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    getToken,
    isAuthenticated: !!user,
  };
};
