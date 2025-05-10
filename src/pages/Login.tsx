
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, isAuthenticated, getUsersByRole, initializeStorage } from '../lib/storage';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
  const [username, setUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'delivery' | 'customer'>('admin');
  const [error, setError] = useState('');
  const [users, setUsers] = useState<Array<{id: string, username: string, name: string}>>([]);
  
  const navigate = useNavigate();
  
  // Initialize storage and check auth
  useEffect(() => {
    // Initialize storage with default values if needed
    initializeStorage();
    
    // Redirect if already logged in
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
    
    // Load users for the selected role
    loadUsers(selectedRole);
  }, [navigate]);
  
  // Load users when role changes
  const loadUsers = (role: 'admin' | 'delivery' | 'customer') => {
    const roleUsers = getUsersByRole(role);
    setUsers(roleUsers.map(u => ({ id: u.id, username: u.username, name: u.name })));
  };
  
  // Handle role change
  const handleRoleChange = (role: 'admin' | 'delivery' | 'customer') => {
    setSelectedRole(role);
    loadUsers(role);
    setUsername('');  // Reset username when changing roles
  };
  
  // Handle login attempt
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim()) {
      setError('Please select a username');
      return;
    }
    
    const session = login(username);
    if (session) {
      navigate('/dashboard');
    } else {
      setError('Invalid username');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-background to-delivery-50 dark:from-background dark:to-delivery-950/20">
      <ThemeToggle />
      
      <div className="w-full max-w-md p-8 bg-card shadow-lg rounded-xl border border-border">
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-delivery-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <rect x="7" y="7" width="3" height="3"></rect>
                <rect x="14" y="7" width="3" height="3"></rect>
                <rect x="7" y="14" width="3" height="3"></rect>
                <rect x="14" y="14" width="3" height="3"></rect>
              </svg>
            </div>
            <div className="pulse-ring animate-pulse-ring"></div>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-6">QR Delivery System</h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Role</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`py-2 px-4 rounded-md text-sm transition-colors ${
                  selectedRole === 'admin'
                    ? 'bg-delivery-500 text-white'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('delivery')}
                className={`py-2 px-4 rounded-md text-sm transition-colors ${
                  selectedRole === 'delivery'
                    ? 'bg-delivery-500 text-white'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                Delivery
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('customer')}
                className={`py-2 px-4 rounded-md text-sm transition-colors ${
                  selectedRole === 'customer'
                    ? 'bg-delivery-500 text-white'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                Customer
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Select Username
            </label>
            <select
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-delivery-500 focus:border-transparent"
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.username}>
                  {user.name} ({user.username})
                </option>
              ))}
            </select>
          </div>
          
          {error && <p className="text-destructive text-sm text-center">{error}</p>}
          
          <button
            type="submit"
            className="w-full py-2 px-4 bg-delivery-500 hover:bg-delivery-600 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-delivery-500 focus:ring-offset-2"
          >
            Log In
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Demo system with simulated authentication</p>
          <p className="mt-1">Data stored in localStorage</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
