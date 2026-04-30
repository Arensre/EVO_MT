import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

export interface ModulePermissions {
  read: boolean;
  write: boolean;
  delete: boolean;
}

export interface UserPermissions {
  customers: ModulePermissions;
  suppliers: ModulePermissions;
  materials: ModulePermissions;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  permissions?: UserPermissions;
}

interface AuthContextType {
  user: User | null;
  permissions: UserPermissions | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  isAdmin: boolean;
  // Permission helpers
  hasPermission: (module: keyof UserPermissions, action: keyof ModulePermissions) => boolean;
  canRead: (module: keyof UserPermissions) => boolean;
  canWrite: (module: keyof UserPermissions) => boolean;
  canDelete: (module: keyof UserPermissions) => boolean;
}

const defaultPermissions: UserPermissions = {
  customers: { read: true, write: true, delete: false },
  suppliers: { read: true, write: false, delete: false },
  materials: { read: false, write: false, delete: false }
};

const adminPermissions: UserPermissions = {
  customers: { read: true, write: true, delete: true },
  suppliers: { read: true, write: true, delete: true },
  materials: { read: true, write: true, delete: true }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/users/me');
      const userData = response.data;
      setUser({ ...userData, avatar_url: userData.avatar_url });
      
      // Set permissions from user data or defaults
      if (userData.role === 'admin') {
        setPermissions(adminPermissions);
      } else if (userData.permissions) {
        // Merge with defaults to ensure all modules exist
        setPermissions({
          ...defaultPermissions,
          ...userData.permissions
        });
      } else {
        setPermissions(defaultPermissions);
      }
    } catch (error) {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await axios.post('/api/auth/login', { username, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser({ ...user, avatar_url: user.avatar_url });
    
    // Set permissions from login response
    if (user.role === 'admin') {
      setPermissions(adminPermissions);
    } else if (user.permissions) {
      setPermissions({
        ...defaultPermissions,
        ...user.permissions
      });
    } else {
      setPermissions(defaultPermissions);
    }
  };

  const logout = async () => {
    try {
      // Optional: Server-side logout
      await axios.post('/api/auth/logout').catch(() => {
        // Ignore errors - client-side logout is what matters
      });
    } finally {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setPermissions(null);
    }
  };

  // Permission helpers
  const hasPermission = (module: keyof UserPermissions, action: keyof ModulePermissions): boolean => {
    if (user?.role === 'admin') return true;
    return permissions?.[module]?.[action] === true;
  };

  const canRead = (module: keyof UserPermissions): boolean => {
    return hasPermission(module, 'read');
  };

  const canWrite = (module: keyof UserPermissions): boolean => {
    return hasPermission(module, 'write');
  };

  const canDelete = (module: keyof UserPermissions): boolean => {
    return hasPermission(module, 'delete');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, 
      permissions, 
      login, 
      logout, 
      refreshUser: fetchUser,
      isLoading, 
      isAdmin,
      hasPermission,
      canRead,
      canWrite,
      canDelete
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
