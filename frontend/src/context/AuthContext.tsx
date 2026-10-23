import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<boolean>;
  logout: () => void;
  updateUser: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('festiva_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('festiva_auth_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('festiva_auth_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('festiva_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session verification failed:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (credentials: { email: string; password: string }): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await authService.login(credentials);
      if (res.success && res.token) {
        localStorage.setItem('festiva_auth_token', res.token);
        localStorage.setItem('festiva_user', JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        toast.success(res.message || 'Logged in successfully!');
        return true;
      }
      return false;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Invalid email or password.';
      toast.error(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string }): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await authService.register(data);
      if (res.success && res.token) {
        localStorage.setItem('festiva_auth_token', res.token);
        localStorage.setItem('festiva_user', JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        toast.success(res.message || 'Welcome to Festiva AI!');
        return true;
      }
      return false;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Registration failed. Please check your inputs.';
      toast.error(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('festiva_auth_token');
    localStorage.removeItem('festiva_user');
    setToken(null);
    setUser(null);
    toast.success('Signed out. See you at your next celebration!');
  };

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updated };
      setUser(newUser);
      localStorage.setItem('festiva_user', JSON.stringify(newUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
