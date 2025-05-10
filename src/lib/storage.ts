
// Data types
export interface User {
  id: string;
  username: string;
  role: 'admin' | 'delivery' | 'customer';
  name: string;
  email?: string;
}

export interface Package {
  id: string;
  title: string;
  description: string;
  qrData: string;
  status: 'pending' | 'in-transit' | 'delivered';
  customerId: string;
  deliveryAgentId: string;
  createdAt: number;
  updatedAt: number;
}

export interface Session {
  userId: string;
  role: 'admin' | 'delivery' | 'customer';
  loggedIn: boolean;
}

// Storage keys
const KEYS = {
  USERS: 'qr-delivery-users',
  PACKAGES: 'qr-delivery-packages',
  SESSION: 'qr-delivery-session',
  THEME: 'qr-delivery-theme',
};

// Initialize data if not exists
export const initializeStorage = () => {
  // Create admin if not exists
  if (!localStorage.getItem(KEYS.USERS)) {
    const adminUser: User = {
      id: 'admin-1',
      username: 'admin',
      role: 'admin',
      name: 'System Admin',
    };
    
    const initialUsers: User[] = [
      adminUser,
      {
        id: 'delivery-1',
        username: 'driver1',
        role: 'delivery',
        name: 'John Driver',
      },
      {
        id: 'customer-1',
        username: 'customer1',
        role: 'customer',
        name: 'Alice Customer',
      }
    ];
    
    localStorage.setItem(KEYS.USERS, JSON.stringify(initialUsers));
  }
  
  // Initialize packages if not exists
  if (!localStorage.getItem(KEYS.PACKAGES)) {
    localStorage.setItem(KEYS.PACKAGES, JSON.stringify([]));
  }
};

// User Management
export const getUsers = (): User[] => {
  const users = localStorage.getItem(KEYS.USERS);
  return users ? JSON.parse(users) : [];
};

export const getUsersByRole = (role: 'admin' | 'delivery' | 'customer'): User[] => {
  const users = getUsers();
  return users.filter(user => user.role === role);
};

export const getUserById = (id: string): User | null => {
  const users = getUsers();
  return users.find(user => user.id === id) || null;
};

export const addUser = (user: Omit<User, 'id'>): User => {
  const users = getUsers();
  const newUser = { 
    ...user, 
    id: `${user.role}-${Date.now()}` 
  };
  
  users.push(newUser);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  return newUser;
};

export const deleteUser = (id: string): boolean => {
  const users = getUsers();
  const filteredUsers = users.filter(user => user.id !== id);
  
  if (filteredUsers.length < users.length) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(filteredUsers));
    return true;
  }
  return false;
};

// Package Management
export const getPackages = (): Package[] => {
  const packages = localStorage.getItem(KEYS.PACKAGES);
  return packages ? JSON.parse(packages) : [];
};

export const getPackageById = (id: string): Package | null => {
  const packages = getPackages();
  return packages.find(pkg => pkg.id === id) || null;
};

export const getPackageByQR = (qrData: string): Package | null => {
  const packages = getPackages();
  return packages.find(pkg => pkg.qrData === qrData) || null;
};

export const getUserPackages = (userId: string): Package[] => {
  const packages = getPackages();
  return packages.filter(pkg => 
    pkg.customerId === userId || pkg.deliveryAgentId === userId
  );
};

export const addPackage = (pkg: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>): Package => {
  const packages = getPackages();
  const timestamp = Date.now();
  
  const newPackage: Package = {
    ...pkg,
    id: `pkg-${timestamp}`,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  
  packages.push(newPackage);
  localStorage.setItem(KEYS.PACKAGES, JSON.stringify(packages));
  return newPackage;
};

export const updatePackageStatus = (id: string, status: Package['status']): Package | null => {
  const packages = getPackages();
  const packageIndex = packages.findIndex(p => p.id === id);
  
  if (packageIndex === -1) return null;
  
  packages[packageIndex] = {
    ...packages[packageIndex],
    status,
    updatedAt: Date.now()
  };
  
  localStorage.setItem(KEYS.PACKAGES, JSON.stringify(packages));
  return packages[packageIndex];
};

// Session Management
export const getSession = (): Session | null => {
  const session = localStorage.getItem(KEYS.SESSION);
  return session ? JSON.parse(session) : null;
};

export const setSession = (session: Session): void => {
  localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
};

export const clearSession = (): void => {
  localStorage.removeItem(KEYS.SESSION);
};

// Theme Management
export const isDarkMode = (): boolean => {
  const theme = localStorage.getItem(KEYS.THEME);
  return theme === 'dark';
};

export const setDarkMode = (isDark: boolean): void => {
  localStorage.setItem(KEYS.THEME, isDark ? 'dark' : 'light');
};

// Auth functions
export const login = (username: string): Session | null => {
  const users = getUsers();
  const user = users.find(u => u.username === username);
  
  if (!user) return null;
  
  const session: Session = {
    userId: user.id,
    role: user.role,
    loggedIn: true
  };
  
  setSession(session);
  return session;
};

export const logout = (): void => {
  clearSession();
};

export const isAuthenticated = (): boolean => {
  const session = getSession();
  return !!session && session.loggedIn;
};
