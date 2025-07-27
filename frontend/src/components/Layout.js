import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const adminMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/admin/queue-calendar', label: 'Kalender', icon: '📅' },
    { path: '/admin/queue-management', label: 'Antrian', icon: '⚡' },
    { path: '/admin/patients', label: 'Pasien', icon: '👥' },
    { path: '/admin/reports', label: 'Laporan', icon: '📊' },
    { path: '/admin/settings', label: 'Setting', icon: '⚙️' },
  ];

  const patientMenuItems = [
    { path: '/dashboard', label: 'Home', icon: '🏠' },
    { path: '/book-queue', label: 'Booking', icon: '➕' },
    { path: '/history', label: 'Riwayat', icon: '📋' },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : patientMenuItems;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Modern Navbar */}
      <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold">A</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    AntreDokter
                  </h1>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            {user && (
              <div className="hidden lg:flex items-center space-x-6">
                <div className="flex items-center space-x-1">
                  {menuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        isActive(item.path)
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <span className="text-sm">{item.icon}</span>
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  ))}
                </div>

                {/* Notification Bell & User Profile & Logout */}
                <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                  <NotificationBell />
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {user.fullName?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden xl:block">
                      <div className="text-sm font-medium text-gray-800 leading-tight">{user.fullName}</div>
                      <div className="text-xs text-gray-500 capitalize leading-tight">{user.role}</div>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors duration-200"
                    title="Keluar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Tablet Navigation */}
            {user && (
              <div className="hidden md:flex lg:hidden items-center space-x-2">
                <NotificationBell />
                {menuItems.slice(0, 4).map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex flex-col items-center space-y-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <span className="text-sm">{item.icon}</span>
                    <span className="text-xs leading-none">{item.label}</span>
                  </Link>
                ))}
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {user.fullName?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors duration-200"
                  title="Keluar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            {user && (
              <div className="md:hidden flex items-center space-x-2">
                <NotificationBell />
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {user.fullName?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Navigation Menu */}
          {user && isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md">
              <div className="px-3 pt-3 pb-4">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {menuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex flex-col items-center space-y-1 px-3 py-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                        isActive(item.path)
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-xs leading-none text-center">{item.label}</span>
                    </Link>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          {user.fullName?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{user.fullName}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Keluar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4">
        {children}
      </main>

      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 text-center text-gray-500 text-sm">
          © 2024 AntreDokter. Sistem Antrian Dokter Online.
        </div>
      </footer>
    </div>
  );
};

export default Layout;