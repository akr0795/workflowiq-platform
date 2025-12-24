import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { User, UserRole, AuthState } from '@/types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const MOCK_USERS: Record<string, User> = {
  'admin@tcs.com': {
    id: '1',
    email: 'admin@tcs.com',
    name: 'Rajesh Kumar',
    role: 'admin',
    department: 'IT Operations',
    createdAt: '2021-01-15',
  },
  'manager@tcs.com': {
    id: '2',
    email: 'manager@tcs.com',
    name: 'Priya Sharma',
    role: 'manager',
    department: 'Software Development',
    createdAt: '2021-03-20',
  },
  'developer@tcs.com': {
    id: '3',
    email: 'developer@tcs.com',
    name: 'Amit Patel',
    role: 'developer',
    department: 'Software Development',
    createdAt: '2022-06-10',
  },
};

// Role-based permissions
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['read', 'write', 'delete', 'approve', 'manage_users', 'view_analytics', 'export_reports'],
  manager: ['read', 'write', 'approve', 'view_analytics', 'export_reports'],
  developer: ['read', 'write', 'view_own_analytics'],
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: MOCK_USERS['developer@tcs.com'], // Default logged in for demo
    isAuthenticated: true,
    isLoading: false,
  });

  const login = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = MOCK_USERS[email.toLowerCase()];
    
    if (user && password === 'password') {
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw new Error('Invalid credentials');
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const hasRole = useCallback((roles: UserRole[]) => {
    if (!authState.user) return false;
    return roles.includes(authState.user.role);
  }, [authState.user]);

  const hasPermission = useCallback((permission: string) => {
    if (!authState.user) return false;
    const permissions = ROLE_PERMISSIONS[authState.user.role];
    return permissions.includes(permission);
  }, [authState.user]);

  const value = useMemo(() => ({
    ...authState,
    login,
    logout,
    hasRole,
    hasPermission,
  }), [authState, login, logout, hasRole, hasPermission]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
