import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../api/authService';

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  switchRole: (role: UserRole) => void;
  login: (emailOrUsername: string, pass: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, role: UserRole, password?: string) => Promise<boolean>;
  updateProfile: (updatedData: Partial<User>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'prajnadhara_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return currentUser?.role || 'student';
  });

  // Verify and hydrate real authenticated session from backend on initial mount
  useEffect(() => {
    const token = localStorage.getItem('prajnadhara_token');
    if (token) {
      authService.getProfile()
        .then((profile) => {
          if (profile && profile.id) {
            setCurrentUser(profile);
            setCurrentRole(profile.role || 'student');
            localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
          }
        })
        .catch(() => {
          // Token expired or invalid
          authService.logout();
          localStorage.removeItem(STORAGE_KEY);
          setCurrentUser(null);
        });
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      setCurrentRole(currentUser.role);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [currentUser]);

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
  };

  const login = async (emailOrUsername: string, pass: string): Promise<boolean> => {
    const user = await authService.login(emailOrUsername, pass);
    if (user && user.id) {
      setCurrentUser(user);
      setCurrentRole(user.role || 'student');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentRole('student');
    localStorage.removeItem(STORAGE_KEY);
  };

  const register = async (name: string, email: string, role: UserRole, password?: string): Promise<boolean> => {
    const user = await authService.register({ name, email, role, password });
    if (user && user.id) {
      setCurrentUser(user);
      setCurrentRole(user.role || role);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return true;
    }
    return false;
  };

  const updateProfile = async (updatedData: Partial<User>) => {
    if (!currentUser) return;
    try {
      const saved = await authService.updateProfile(updatedData);
      setCurrentUser(saved);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      setCurrentUser(prev => prev ? { ...prev, ...updatedData } : null);
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await authService.getProfile();
      if (profile) {
        setCurrentUser(profile);
        setCurrentRole(profile.role || 'student');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      }
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        isAuthenticated: !!currentUser,
        switchRole,
        login,
        logout,
        register,
        updateProfile,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
