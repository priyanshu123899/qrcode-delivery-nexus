
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { isAuthenticated, getSession } from '../lib/storage';
import Header from '../components/Header';
import ThemeToggle from '../components/ThemeToggle';
import AdminDashboard from './admin/AdminDashboard';
import DeliveryDashboard from './delivery/DeliveryDashboard';
import CustomerDashboard from './customer/CustomerDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const session = getSession();
  
  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);
  
  if (!isAuthenticated() || !session) {
    return <Navigate to="/" />;
  }
  
  // Render dashboard based on role
  const renderDashboard = () => {
    switch (session.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'delivery':
        return <DeliveryDashboard />;
      case 'customer':
        return <CustomerDashboard />;
      default:
        return <div>Unknown role</div>;
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ThemeToggle />
      <main className="container py-8 px-4">{renderDashboard()}</main>
    </div>
  );
};

export default Dashboard;
