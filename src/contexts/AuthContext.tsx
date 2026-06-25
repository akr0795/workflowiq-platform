import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthState } from '@/types';
import { loadFromStorage, saveToStorage } from '@/lib/storage';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  department: string;
}

interface StoredUser extends User {
  password: string;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<Pick<User, 'name' | 'email' | 'department'>>) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const REGISTERED_USERS_KEY = 'workflowiq_registered_users';
const SESSION_KEY = 'workflowiq_session';

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

const MOCK_PASSWORDS: Record<string, string> = {
  'admin@tcs.com': 'password',
  'manager@tcs.com': 'password',
  'developer@tcs.com': 'password',
};

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['read', 'write', 'delete', 'approve', 'manage_users', 'view_analytics', 'export_reports'],
  manager: ['read', 'write', 'approve', 'view_analytics', 'export_reports'],
  developer: ['read', 'write', 'view_own_analytics'],
};

const loadRegisteredUsers = (): Record<string, StoredUser> =>
  loadFromStorage(REGISTERED_USERS_KEY, {} as Record<string, StoredUser>);

const saveRegisteredUsers = (users: Record<string, StoredUser>) => {
  saveToStorage(REGISTERED_USERS_KEY, users);
};

const findUserByEmail = (email: string): { user: User; password: string } | null => {
  const normalizedEmail = email.toLowerCase();
  const mockUser = MOCK_USERS[normalizedEmail];
  if (mockUser) {
    return { user: mockUser, password: MOCK_PASSWORDS[normalizedEmail] };
  }
  const registeredUser = loadRegisteredUsers()[normalizedEmail];
  if (registeredUser) {
    const { password, ...user } = registeredUser;
    return { user, password };
  }
  return null;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const session = loadFromStorage<{ email: string } | null>(SESSION_KEY, null);
    if (session?.email) {
      const match = findUserByEmail(session.email);
      if (match) {
        setAuthState({ user: match.user, isAuthenticated: true, isLoading: false });
        return;
      }
    }
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    await new Promise(resolve => setTimeout(resolve, 800));
    const match = findUserByEmail(email);
    if (match && match.password === password) {
      saveToStorage(SESSION_KEY, { email: match.user.email.toLowerCase() });
      setAuthState({ user: match.user, isAuthenticated: true, isLoading: false });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw new Error('Invalid credentials');
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    await new Promise(resolve => setTimeout(resolve, 800));
    const normalizedEmail = data.email.toLowerCase().trim();
    if (MOCK_USERS[normalizedEmail] || loadRegisteredUsers()[normalizedEmail]) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw new Error('An account with this email already exists');
    }
    const registeredUsers = loadRegisteredUsers();
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      name: data.name.trim(),
      role: 'developer',
      department: data.department.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      password: data.password,
    };
    registeredUsers[normalizedEmail] = newUser;
    saveRegisteredUsers(registeredUsers);
    setAuthState(prev => ({ ...prev, isLoading: false }));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const updateUser = useCallback((data: Partial<Pick<User, 'name' | 'email' | 'department'>>) => {
    setAuthState(prev => {
      if (!prev.user) return prev;
      const updatedUser = { ...prev.user, ...data };
      const registeredUsers = loadRegisteredUsers();
      const key = prev.user.email.toLowerCase();
      if (registeredUsers[key]) {
        registeredUsers[key] = { ...registeredUsers[key], ...data };
        if (data.email) {
          const newKey = data.email.toLowerCase();
          registeredUsers[newKey] = { ...registeredUsers[key], email: newKey };
          delete registeredUsers[key];
          saveToStorage(SESSION_KEY, { email: newKey });
        }
        saveRegisteredUsers(registeredUsers);
      }
      return { ...prev, user: updatedUser };
    });
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!authState.user) throw new Error('Not authenticated');
    const key = authState.user.email.toLowerCase();
    const registeredUsers = loadRegisteredUsers();
    const stored = registeredUsers[key];
    if (!stored) throw new Error('Password change is only available for registered accounts');
    if (stored.password !== currentPassword) throw new Error('Current password is incorrect');
    if (newPassword.length < 6) throw new Error('New password must be at least 6 characters');
    registeredUsers[key] = { ...stored, password: newPassword };
    saveRegisteredUsers(registeredUsers);
  }, [authState.user]);

  const hasRole = useCallback((roles: UserRole[]) => {
    if (!authState.user) return false;
    return roles.includes(authState.user.role);
  }, [authState.user]);

  const hasPermission = useCallback((permission: string) => {
    if (!authState.user) return false;
    return ROLE_PERMISSIONS[authState.user.role].includes(permission);
  }, [authState.user]);

  const value = useMemo(() => ({
    ...authState,
    login,
    register,
    logout,
    updateUser,
    changePassword,
    hasRole,
    hasPermission,
  }), [authState, login, register, logout, updateUser, changePassword, hasRole, hasPermission]);

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
