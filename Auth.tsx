import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isLoggedIn: boolean;
  user: any;
  login: (token: string, user: any, keepLoggedIn: boolean) => void;
  logout: () => void;
  setIsLoggedIn: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkStoredLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userJson = await AsyncStorage.getItem('user');
        if (token && userJson) {
          setIsLoggedIn(true);
          setUser(JSON.parse(userJson));
          console.log('🔓 Logged in from stored data');
        } else {
          console.log('🔒 No valid login found in storage');
        }
      } catch (error) {
        console.error('❌ Failed to load login data from AsyncStorage:', error);
      }
    };
    checkStoredLogin();
  }, []);

  const login = async (token: string, user: any, keepLoggedIn: boolean) => {
    try {
      if (keepLoggedIn && token && user) {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        console.log('✅ Stored token and user');
      }
      setUser(user);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('❌ Failed to store login data:', error);
    }
  };
  

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setIsLoggedIn(false);
      setUser(null);
      console.log('👋 Logged out and cleared storage');
    } catch (error) {
      console.error('❌ Failed to logout and clear storage:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
