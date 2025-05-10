
import React, { useState, useEffect } from 'react';
import { 
  getUsers, 
  getUsersByRole, 
  addUser, 
  deleteUser,
  getPackages,
  addPackage,
  updatePackageStatus,
} from '../../lib/storage';
import { generateQRCode, generateQRValue } from '../../lib/qrCode';
import type { User, Package } from '../../lib/storage';

const AdminDashboard = () => {
  // State for users
  const [deliveryAgents, setDeliveryAgents] = useState<User[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  
  // State for new user form
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserRole, setNewUserRole] = useState<'delivery' | 'customer'>('delivery');
  
  // State for packages
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  
  // State for new package form
  const [newPackageTitle, setNewPackageTitle] = useState('');
  const [newPackageDescription, setNewPackageDescription] = useState('');
  const [newPackageCustomerId, setNewPackageCustomerId] = useState('');
  const [newPackageDeliveryAgentId, setNewPackageDeliveryAgentId] = useState('');
  
  // Load users and packages
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = () => {
    setDeliveryAgents(getUsersByRole('delivery'));
    setCustomers(getUsersByRole('customer'));
    setPackages(getPackages());
  };
  
  // Handle user creation
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUserName || !newUserUsername) {
      alert('Please fill in all fields');
      return;
    }
    
    // Check if username exists
    const allUsers = getUsers();
    if (allUsers.some(user => user.username === newUserUsername)) {
      alert('Username already exists');
      return;
    }
    
    addUser({
      username: newUserUsername,
      name: newUserName,
      role: newUserRole,
    });
    
    // Reset form and reload data
    setNewUserName('');
    setNewUserUsername('');
    loadData();
  };
  
  // Handle user deletion
  const handleDeleteUser = (userId: string) => {
    // Check if user has packages
    const userPackages = packages.filter(
      pkg => pkg.customerId === userId || pkg.deliveryAgentId === userId
    );
    
    if (userPackages.length > 0) {
      alert('Cannot delete user with assigned packages');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
      loadData();
    }
  };
  
  // Handle package creation
  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPackageTitle || !newPackageCustomerId || !newPackageDeliveryAgentId) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Generate QR value
    const qrValue = generateQRValue(
      `temp-${Date.now()}`,
      newPackageCustomerId,
      newPackageDeliveryAgentId
    );
    
    // Create package
    const newPackage = addPackage({
      title: newPackageTitle,
      description: newPackageDescription,
      qrData: qrValue,
      status: 'pending',
      customerId: newPackageCustomerId,
      deliveryAgentId: newPackageDeliveryAgentId,
    });
    
    // Reset form and reload data
    setNewPackageTitle('');
    setNewPackageDescription('');
    setNewPackageCustomerId('');
    setNewPackageDeliveryAgentId('');
    loadData();
  };
  
  // Handle viewing package QR
  const handleViewPackageQR = async (pkg: Package) => {
    setSelectedPackage(pkg);
    
    try {
      const qrImageUrl = await generateQRCode(pkg.qrData);
      setQrCodeImage(qrImageUrl);
    } catch (error) {
      console.error('Error generating QR:', error);
      alert('Failed to generate QR code');
    }
  };
  
  // Handle package status update
  const handleUpdatePackageStatus = (packageId: string, status: Package['status']) => {
    updatePackageStatus(packageId, status);
    loadData();
    
    // Update selected package if it's the one being updated
    if (selectedPackage && selectedPackage.id === packageId) {
      const updatedPackage = packages.find(p => p.id === packageId);
      if (updatedPackage) {
        setSelectedPackage(updatedPackage);
      }
    }
  };
  
  const getStatusBadgeClass = (status: Package['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'in-transit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        {/* Package Management Section */}
        <section className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-4">Package Management</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Create New Package</h3>
            <form onSubmit={handleAddPackage} className="space-y-4">
              <div>
                <label htmlFor="packageTitle" className="block text-sm font-medium mb-1">
                  Title*
                </label>
                <input
                  id="packageTitle"
                  type="text"
                  value={newPackageTitle}
                  onChange={(e) => setNewPackageTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="packageDescription" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  id="packageDescription"
                  value={newPackageDescription}
                  onChange={(e) => setNewPackageDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md"
                  rows={2}
                />
              </div>
              
              <div>
                <label htmlFor="packageCustomer" className="block text-sm font-medium mb-1">
                  Customer*
                </label>
                <select
                  id="packageCustomer"
                  value={newPackageCustomerId}
                  onChange={(e) => setNewPackageCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md"
                  required
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="packageDeliveryAgent" className="block text-sm font-medium mb-1">
                  Delivery Agent*
                </label>
                <select
                  id="packageDeliveryAgent"
                  value={newPackageDeliveryAgentId}
                  onChange={(e) => setNewPackageDeliveryAgentId(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md"
                  required
                >
                  <option value="">Select delivery agent</option>
                  {deliveryAgents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                type="submit"
                className="w-full py-2 px-4 bg-delivery-500 text-white font-medium rounded-md hover:bg-delivery-600 transition-colors"
              >
                Create Package
              </button>
            </form>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">All Packages</h3>
            {packages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No packages yet</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {packages.map((pkg) => {
                  const customer = customers.find(c => c.id === pkg.customerId);
                  const agent = deliveryAgents.find(a => a.id === pkg.deliveryAgentId);
                  
                  return (
                    <div
                      key={pkg.id}
                      className="p-3 bg-background rounded-lg border border-border flex justify-between items-center"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{pkg.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeClass(pkg.status)}`}>
                            {pkg.status}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <p>To: {customer?.name || 'Unknown'}</p>
                          <p>Via: {agent?.name || 'Unknown'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewPackageQR(pkg)}
                          className="p-1.5 bg-secondary hover:bg-secondary/80 rounded-md text-xs font-medium transition-colors"
                        >
                          View QR
                        </button>
                        
                        <select
                          value={pkg.status}
                          onChange={(e) => handleUpdatePackageStatus(pkg.id, e.target.value as Package['status'])}
                          className="text-xs px-2 py-1.5 bg-background border border-input rounded-md"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-transit">In Transit</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
        
        {/* User Management Section */}
        <section className="space-y-6">
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Create New User</h3>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label htmlFor="userName" className="block text-sm font-medium mb-1">
                    Name
                  </label>
                  <input
                    id="userName"
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="userUsername" className="block text-sm font-medium mb-1">
                    Username
                  </label>
                  <input
                    id="userUsername"
                    type="text"
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewUserRole('delivery')}
                      className={`py-2 rounded-md text-sm transition-colors ${
                        newUserRole === 'delivery'
                          ? 'bg-delivery-500 text-white'
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      Delivery Agent
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewUserRole('customer')}
                      className={`py-2 rounded-md text-sm transition-colors ${
                        newUserRole === 'customer'
                          ? 'bg-delivery-500 text-white'
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      Customer
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-delivery-500 text-white font-medium rounded-md hover:bg-delivery-600 transition-colors"
                >
                  Create User
                </button>
              </form>
            </div>
          </div>
          
          {/* Delivery Agents List */}
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <h3 className="text-lg font-medium mb-3">Delivery Agents</h3>
            {deliveryAgents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No delivery agents yet</p>
            ) : (
              <div className="space-y-3">
                {deliveryAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="p-3 bg-background rounded-lg border border-border flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-medium">{agent.name}</h4>
                      <p className="text-sm text-muted-foreground">@{agent.username}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(agent.id)}
                      className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-md text-xs font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Customers List */}
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <h3 className="text-lg font-medium mb-3">Customers</h3>
            {customers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No customers yet</p>
            ) : (
              <div className="space-y-3">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="p-3 bg-background rounded-lg border border-border flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-medium">{customer.name}</h4>
                      <p className="text-sm text-muted-foreground">@{customer.username}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(customer.id)}
                      className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-md text-xs font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
      
      {/* QR Code Modal */}
      {selectedPackage && qrCodeImage && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card p-6 rounded-xl shadow-lg border border-border max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Package QR Code</h3>
            
            <div className="mb-6">
              <div className="flex flex-col items-center space-y-4">
                <img src={qrCodeImage} alt="QR Code" className="w-64 h-64" />
                <div className="text-center">
                  <h4 className="font-medium">{selectedPackage.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Status: {selectedPackage.status}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-muted-foreground text-sm mb-4">
              <p>Access restrictions:</p>
              <ul className="list-disc list-inside">
                <li>Admin (full access)</li>
                <li>Assigned Delivery Agent</li>
                <li>Assigned Customer</li>
              </ul>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSelectedPackage(null);
                  setQrCodeImage(null);
                }}
                className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
