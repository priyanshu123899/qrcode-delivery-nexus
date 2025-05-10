
import React, { useState, useEffect } from 'react';
import { getSession, getUserPackages, getPackageByQR, updatePackageStatus, getUserById } from '../../lib/storage';
import QRScanner from '../../components/QRScanner';
import type { Package } from '../../lib/storage';

const DeliveryDashboard = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedPackage, setScannedPackage] = useState<Package | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState<boolean>(false);
  
  const session = getSession();
  
  // Load packages assigned to the delivery agent
  useEffect(() => {
    if (session?.userId) {
      loadUserPackages(session.userId);
    }
  }, []);
  
  const loadUserPackages = (userId: string) => {
    const userPackages = getUserPackages(userId);
    setPackages(userPackages);
  };
  
  // Handle QR code scan
  const handleScan = (qrData: string) => {
    // Reset states
    setScanError(null);
    setScannedPackage(null);
    setScanSuccess(false);
    
    // Get package from QR data
    const pkg = getPackageByQR(qrData);
    
    if (!pkg) {
      setScanError('Invalid QR code - Package not found');
      return;
    }
    
    // Check if delivery agent has access to this package
    if (session && pkg.deliveryAgentId !== session.userId) {
      setScanError('Access denied - This package is not assigned to you');
      return;
    }
    
    // Package found and access granted
    setScannedPackage(pkg);
    setScanSuccess(true);
  };
  
  // Update package status
  const handleUpdateStatus = (packageId: string, status: Package['status']) => {
    updatePackageStatus(packageId, status);
    
    // Update local states
    if (session?.userId) {
      loadUserPackages(session.userId);
      
      // Update scanned package if it's the one being updated
      if (scannedPackage && scannedPackage.id === packageId) {
        const updatedPackage = getPackageByQR(scannedPackage.qrData);
        if (updatedPackage) {
          setScannedPackage(updatedPackage);
        }
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
      <h1 className="text-2xl font-bold">Delivery Agent Dashboard</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        {/* QR Scanner Section */}
        <section className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-4">Scan Package QR</h2>
          
          {!showScanner ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-delivery-500">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <rect x="7" y="7" width="3" height="3"></rect>
                  <rect x="14" y="7" width="3" height="3"></rect>
                  <rect x="7" y="14" width="3" height="3"></rect>
                  <rect x="14" y="14" width="3" height="3"></rect>
                </svg>
              </div>
              <p className="mb-6 text-muted-foreground">
                Scan a package QR code to verify it and update its status
              </p>
              <button
                onClick={() => setShowScanner(true)}
                className="px-4 py-2 bg-delivery-500 text-white font-medium rounded-md hover:bg-delivery-600 transition-colors"
              >
                Open Scanner
              </button>
            </div>
          ) : (
            <div>
              <QRScanner onScan={handleScan} />
              
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => {
                    setShowScanner(false);
                    setScanError(null);
                    setScannedPackage(null);
                    setScanSuccess(false);
                  }}
                  className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm font-medium"
                >
                  Cancel Scanning
                </button>
              </div>
            </div>
          )}
          
          {/* Scan Results */}
          {(scanError || scanSuccess) && (
            <div className={`mt-6 p-4 border rounded-lg ${
              scanError 
                ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800/30' 
                : 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800/30'
            }`}>
              {scanError && (
                <div className="flex flex-col items-center text-red-700 dark:text-red-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                  <p>{scanError}</p>
                </div>
              )}
              
              {scanSuccess && scannedPackage && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center text-green-700 dark:text-green-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <p>Package verified successfully!</p>
                  </div>
                  
                  <div className="bg-background p-4 rounded-lg">
                    <h3 className="font-medium text-lg mb-2">{scannedPackage.title}</h3>
                    {scannedPackage.description && (
                      <p className="text-sm text-muted-foreground mb-3">{scannedPackage.description}</p>
                    )}
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-medium text-sm">Status:</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeClass(scannedPackage.status)}`}>
                        {scannedPackage.status}
                      </span>
                    </div>
                    
                    <p className="text-sm mb-1">
                      <span className="font-medium">Customer:</span>{' '}
                      {getUserById(scannedPackage.customerId)?.name || 'Unknown'}
                    </p>
                    
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-1">Update status:</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleUpdateStatus(scannedPackage.id, 'pending')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            scannedPackage.status === 'pending'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:hover:bg-yellow-900/50'
                          }`}
                        >
                          Pending
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(scannedPackage.id, 'in-transit')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            scannedPackage.status === 'in-transit'
                              ? 'bg-blue-500 text-white'
                              : 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'
                          }`}
                        >
                          In Transit
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(scannedPackage.id, 'delivered')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            scannedPackage.status === 'delivered'
                              ? 'bg-green-500 text-white'
                              : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50'
                          }`}
                        >
                          Delivered
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
        
        {/* Packages List Section */}
        <section className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-4">My Packages</h2>
          
          {packages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No packages assigned to you yet</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {packages.map((pkg) => {
                const customer = getUserById(pkg.customerId);
                
                return (
                  <div
                    key={pkg.id}
                    className="p-4 bg-background rounded-lg border border-border"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium">{pkg.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeClass(pkg.status)}`}>
                        {pkg.status}
                      </span>
                    </div>
                    
                    {pkg.description && (
                      <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                    )}
                    
                    <p className="text-sm mb-3">
                      <span className="font-medium">Customer:</span>{' '}
                      {customer?.name || 'Unknown'}
                    </p>
                    
                    <div>
                      <p className="text-sm font-medium mb-1">Update status:</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleUpdateStatus(pkg.id, 'pending')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            pkg.status === 'pending'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:hover:bg-yellow-900/50'
                          }`}
                        >
                          Pending
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(pkg.id, 'in-transit')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            pkg.status === 'in-transit'
                              ? 'bg-blue-500 text-white'
                              : 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'
                          }`}
                        >
                          In Transit
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(pkg.id, 'delivered')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            pkg.status === 'delivered'
                              ? 'bg-green-500 text-white'
                              : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50'
                          }`}
                        >
                          Delivered
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
