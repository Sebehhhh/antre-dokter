import React, { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  useEffect(() => {
    loadPatients();
    loadStats();
  }, [searchTerm, sortBy, sortOrder, pagination.currentPage]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllPatients({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: searchTerm,
        sortBy,
        sortOrder
      });
      
      setPatients(response.data.data.patients);
      setPagination(response.data.data.pagination);
      setError('');
    } catch (error) {
      console.error('Error loading patients:', error);
      setError('Gagal memuat data pasien');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await adminAPI.getPatientStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error loading patient stats:', error);
    }
  };

  const handlePatientClick = async (patient) => {
    try {
      setActionLoading('detail-' + patient.id);
      const response = await adminAPI.getPatientDetail(patient.id);
      setSelectedPatient(response.data.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error loading patient detail:', error);
      alert('Gagal memuat detail pasien');
    } finally {
      setActionLoading('');
    }
  };

  const handleStatusToggle = async (patient) => {
    if (!window.confirm(`Apakah Anda yakin ingin ${patient.isActive ? 'menonaktifkan' : 'mengaktifkan'} pasien ini?`)) {
      return;
    }

    try {
      setActionLoading('status-' + patient.id);
      await adminAPI.updatePatientStatus(patient.id, { isActive: !patient.isActive });
      await loadPatients();
      alert(`Pasien berhasil ${!patient.isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
    } catch (error) {
      console.error('Error updating patient status:', error);
      alert('Gagal mengubah status pasien');
    } finally {
      setActionLoading('');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-50 text-green-700 border border-green-200' 
          : 'bg-red-50 text-red-700 border border-red-200'
      }`}>
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
        {isActive ? 'Aktif' : 'Nonaktif'}
      </span>
    );
  };

  const getQueueStatusBadge = (status) => {
    const config = {
      waiting: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', label: 'Menunggu' },
      in_service: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Dilayani' },
      completed: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', label: 'Selesai' },
      cancelled: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: 'Dibatalkan' },
      no_show: { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700', label: 'Tidak Hadir' }
    };
    
    const statusConfig = config[status] || config.waiting;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text}`}>
        {statusConfig.label}
      </span>
    );
  };

  if (loading && patients.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Memuat data pasien...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                👥 Data Pasien
              </h1>
              <p className="text-gray-600 mt-2">Kelola data dan riwayat pasien</p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={loadPatients}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors duration-200 disabled:opacity-50"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-500 text-xl mr-3">⚠️</span>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Pasien</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalPatients || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pasien Aktif</p>
                <p className="text-2xl font-bold text-green-600">{stats.activePatients || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pasien Nonaktif</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactivePatients || 0}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Baru Bulan Ini</p>
                <p className="text-2xl font-bold text-blue-600">{stats.newThisMonth || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🆕</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Antri Aktif</p>
                <p className="text-2xl font-bold text-orange-600">{stats.patientsWithActiveQueues || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cari Pasien</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama atau nomor telepon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="flex items-end space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Urutkan</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="createdAt">Tanggal Daftar</option>
                  <option value="fullName">Nama</option>
                  <option value="lastLogin">Login Terakhir</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Urutan</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="DESC">Terbaru</option>
                  <option value="ASC">Terlama</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Patient List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {patients.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👥</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Tidak ada data pasien</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Tidak ditemukan pasien yang sesuai dengan pencarian' : 'Belum ada pasien yang terdaftar'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pasien</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statistik Antrian</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terakhir Login</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {patients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                              {patient.fullName?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{patient.fullName}</div>
                              <div className="text-sm text-gray-500">Bergabung {formatDate(patient.createdAt)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{patient.phoneNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(patient.isActive)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">{patient.queueStats?.total || 0}</div>
                              <div className="text-xs text-gray-500">Total</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">{patient.queueStats?.completed || 0}</div>
                              <div className="text-xs text-gray-500">Selesai</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-yellow-600">{patient.queueStats?.waiting || 0}</div>
                              <div className="text-xs text-gray-500">Menunggu</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.lastLogin ? formatDateTime(patient.lastLogin) : 'Belum pernah'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            onClick={() => handlePatientClick(patient)}
                            disabled={actionLoading === 'detail-' + patient.id}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 disabled:opacity-50 text-xs font-medium"
                          >
                            {actionLoading === 'detail-' + patient.id ? (
                              <div className="w-3 h-3 animate-spin rounded-full border border-blue-700 border-t-transparent mr-1"></div>
                            ) : (
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                            Detail
                          </button>
                          <button
                            onClick={() => handleStatusToggle(patient)}
                            disabled={actionLoading === 'status-' + patient.id}
                            className={`inline-flex items-center px-3 py-1 rounded-lg transition-colors duration-200 disabled:opacity-50 text-xs font-medium ${
                              patient.isActive 
                                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {actionLoading === 'status-' + patient.id ? (
                              <div className="w-3 h-3 animate-spin rounded-full border border-current border-t-transparent mr-1"></div>
                            ) : (
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={patient.isActive ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                              </svg>
                            )}
                            {patient.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Menampilkan <span className="font-medium">{((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}</span> sampai{' '}
                      <span className="font-medium">
                        {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                      </span> dari{' '}
                      <span className="font-medium">{pagination.totalItems}</span> pasien
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                        disabled={!pagination.hasPrevPage || loading}
                        className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sebelumnya
                      </button>
                      <span className="text-sm text-gray-700">
                        Halaman {pagination.currentPage} dari {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                        disabled={!pagination.hasNextPage || loading}
                        className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Selanjutnya
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Patient Detail Modal */}
        {showDetailModal && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">Detail Pasien</h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Patient Info */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {selectedPatient.patient?.fullName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{selectedPatient.patient?.fullName}</h3>
                      <p className="text-gray-600">{selectedPatient.patient?.phoneNumber}</p>
                      <div className="mt-2">{getStatusBadge(selectedPatient.patient?.isActive)}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Bergabung</p>
                      <p className="font-medium">{formatDate(selectedPatient.patient?.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Login Terakhir</p>
                      <p className="font-medium">
                        {selectedPatient.patient?.lastLogin ? formatDateTime(selectedPatient.patient.lastLogin) : 'Belum pernah'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Antrian</p>
                      <p className="font-medium text-blue-600">{selectedPatient.stats?.total || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Antrian Selesai</p>
                      <p className="font-medium text-green-600">{selectedPatient.stats?.completed || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Queue Statistics */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Statistik Antrian</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { label: 'Total', value: selectedPatient.stats?.total || 0, color: 'blue' },
                      { label: 'Menunggu', value: selectedPatient.stats?.waiting || 0, color: 'yellow' },
                      { label: 'Selesai', value: selectedPatient.stats?.completed || 0, color: 'green' },
                      { label: 'Dibatalkan', value: selectedPatient.stats?.cancelled || 0, color: 'red' },
                      { label: 'Tidak Hadir', value: selectedPatient.stats?.no_show || 0, color: 'gray' }
                    ].map((stat) => (
                      <div key={stat.label} className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Queues */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Riwayat Antrian Terbaru</h4>
                  {selectedPatient.queues?.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedPatient.queues.slice(0, 10).map((queue) => (
                        <div key={queue.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {queue.queueNumber}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">Antrian #{queue.queueNumber}</p>
                              <p className="text-sm text-gray-600">{formatDate(queue.appointmentDate)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {getQueueStatusBadge(queue.status)}
                            <p className="text-xs text-gray-500 mt-1">{formatDateTime(queue.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Belum ada riwayat antrian
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPatients;