
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getSession, getUserById } from '../lib/storage';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const session = getSession();
  const user = session ? getUserById(session.userId) : null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleBadgeClass = () => {
    if (!session) return 'bg-gray-200 text-gray-700';
    
    switch (session.role) {
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'delivery':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'customer':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-delivery-500">
            <path d="M21 8L17 4H3v16h4"></path>
            <path d="M12 20h8a1 1 0 0 0 1-1V9.5L16.5 5H12v15Z"></path>
          </svg>
          <span className="font-bold text-xl">QR Delivery</span>
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium">{user.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${roleBadgeClass()}`}>
                {session?.role.charAt(0).toUpperCase() + session?.role.slice(1)}
              </span>
            </div>
            <button 
              onClick={handleLogout} 
              className="p-2 rounded-md text-sm font-medium bg-secondary hover:bg-secondary/80 transition-colors"
              aria-label="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
