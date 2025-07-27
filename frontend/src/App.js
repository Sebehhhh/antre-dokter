import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookQueue from './pages/BookQueue';
import AdminSettings from './pages/AdminSettings';
import AdminQueueCalendar from './pages/AdminQueueCalendar';
import AdminQueueManagement from './pages/AdminQueueManagement';
import AdminPatients from './pages/AdminPatients';
import AdminReports from './pages/AdminReports';
import PatientHistory from './pages/PatientHistory';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/book-queue" element={
            <PrivateRoute allowedRoles={['patient']}>
              <Layout>
                <BookQueue />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/history" element={
            <PrivateRoute allowedRoles={['patient']}>
              <Layout>
                <PatientHistory />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/admin/settings" element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout>
                <AdminSettings />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/admin/queue-calendar" element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout>
                <AdminQueueCalendar />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/admin/queue-management" element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout>
                <AdminQueueManagement />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/admin/patients" element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout>
                <AdminPatients />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/admin/reports" element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout>
                <AdminReports />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/unauthorized" element={
            <Layout>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-red-600 mb-4">
                  Akses Ditolak
                </h1>
                <p className="text-gray-600">
                  Anda tidak memiliki izin untuk mengakses halaman ini.
                </p>
              </div>
            </Layout>
          } />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="*" element={
            <Layout>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                  Halaman Tidak Ditemukan
                </h1>
                <p className="text-gray-600">
                  Halaman yang Anda cari tidak ada.
                </p>
              </div>
            </Layout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;