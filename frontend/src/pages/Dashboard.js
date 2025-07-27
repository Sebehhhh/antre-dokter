import React from 'react';
import { useAuth } from '../hooks/useAuth';
import AdminDashboard from './AdminDashboard';
import PatientDashboard from './PatientDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Route to appropriate dashboard based on user role
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }
  
  if (user?.role === 'patient') {
    return <PatientDashboard />;
  }

  // Fallback for unknown roles
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Role tidak dikenal</h2>
        <p className="text-gray-600">Silakan hubungi administrator</p>
      </div>
    </div>
  );
};

export default Dashboard;