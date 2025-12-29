
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Refined Roles based on SKK Migas PTK-007
export type UserRole = 'scm' | 'technical' | 'vendor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  company?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persisted session
    const storedUser = localStorage.getItem('iotace_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, role: UserRole) => {
    let name = '';
    let avatar = '';
    let company = '';
    let id = Date.now().toString();

    // Simulate Role-Based Identity
    if (role === 'scm') {
        id = 'u-scm-01';
        name = 'Sarah (Ka. Pengadaan)';
        avatar = 'SC';
        company = 'SKK Migas - Divisi Pengadaan';
    } else if (role === 'technical') {
        id = 'u-tech-01';
        name = 'Ir. Budi (Chief Engineer)';
        avatar = 'TC';
        company = 'SKK Migas - Divisi Teknis';
    } else if (role === 'vendor') {
        // MATCHING MOCK DATA (v-002 Global Offshore Indonesia)
        id = 'v-002';
        name = 'Hartono (Ops Manager)';
        avatar = 'VN';
        company = 'Global Offshore Indonesia';
    }

    const newUser: User = {
      id,
      name,
      email,
      role,
      avatar,
      company
    };
    setUser(newUser);
    localStorage.setItem('iotace_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('iotace_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
