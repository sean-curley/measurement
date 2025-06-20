import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

type AuthContextType = {
  userToken: string | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      const token = await SecureStore.getItemAsync('user-token');
      setUserToken(token);
      setIsLoading(false);
    };
    loadToken();
  }, []);

  const login = async (token: string) => {
    await SecureStore.setItemAsync('user-token', token);
    setUserToken(token);
    router.replace('/tabs'); // redirect after login
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('user-token');
    setUserToken(null);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ userToken, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
