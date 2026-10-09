import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, InstructorApplication } from '../types';
import { DEMO_USERS, INSTRUCTORS } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  switchRole: (role: UserRole) => void;
  loginAsDemo: (role: UserRole) => void;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, role: UserRole) => boolean;
  updateProfile: (updatedData: Partial<User>) => void;
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
    return DEMO_USERS.student;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return currentUser?.role || 'student';
  });

  useEffect(() => {
    if (currentUser) {
      setCurrentRole(currentUser.role);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [currentUser]);

  const switchRole = (role: UserRole) => {
    if (DEMO_USERS[role]) {
      setCurrentUser(DEMO_USERS[role]);
      setCurrentRole(role);
    } else if (currentUser) {
      const updated = { ...currentUser, role };
      setCurrentUser(updated);
      setCurrentRole(role);
    }
  };

  const loginAsDemo = (role: UserRole) => {
    const demo = DEMO_USERS[role];
    if (demo) {
      setCurrentUser(demo);
      setCurrentRole(role);
    }
  };

  const login = (email: string) => {
    // Check if demo user
    const matched = Object.values(DEMO_USERS).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setCurrentUser(matched);
      return true;
    }
    // Check instructors
    const matchedInst = INSTRUCTORS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matchedInst) {
      setCurrentUser(matchedInst);
      return true;
    }
    // Generic login
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' '),
      email,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
      role: 'student',
      enrolledCourseIds: [],
      wishlistCourseIds: [],
      joinedAt: new Date().toISOString().split('T')[0]
    };
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRole('student');
  };

  const register = (name: string, email: string, role: UserRole) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
      role,
      enrolledCourseIds: [],
      wishlistCourseIds: [],
      joinedAt: new Date().toISOString().split('T')[0],
      isApprovedInstructor: role === 'instructor'
    };
    setCurrentUser(newUser);
    return true;
  };

  const updateProfile = (updatedData: Partial<User>) => {
    if (!currentUser) return;
    setCurrentUser(prev => prev ? { ...prev, ...updatedData } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        isAuthenticated: !!currentUser,
        switchRole,
        loginAsDemo,
        login,
        logout,
        register,
        updateProfile
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
