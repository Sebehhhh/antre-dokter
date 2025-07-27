import React, { useState, useEffect } from 'react';
import { queueAPI, adminAPI } from '../utils/api';
import { useLocation } from 'react-router-dom';
import { getWitaDateString } from '../utils/timezone';

const AdminQueueManagement = () => {
  const location = useLocation();
  const [queues, setQueues] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedDate, setSelectedDate] = useState(() => {
    // Check if date parameter exists in URL
    const urlParams = new URLSearchParams(location.search);
    const dateParam = urlParams.get('date');
    
    return dateParam || getWitaDateString();
  });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [filter, setFilter] = useState('all'); // all, waiting, in_service, completed, cancelled, emergency_cancelled
  const [message, setMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [searchPatient, setSearchPatient] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchQueues();
  }, [selectedDate]);

  useEffect(() => {
    if (showAddModal) {
      loadPatients();
    }
  }, [showAddModal]);

  const fetchQueues = async () => {
    setLoading(true);
    try {
      const response = await queueAPI.getQueuesByDate(selectedDate);
      setQueues(response.data.data.queues || []);
      setStats(response.data.data.stats || {});
    } catch (error) {
      console.error('Error fetching queues:', error);
      setQueues([]);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  const handleCallQueue = async (queueId) => {
    setActionLoading(queueId);
    try {
      const response = await queueAPI.updateQueueStatus(queueId, { status: 'in_service' });
      setMessage(response.data.message);
      await fetchQueues();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Gagal memanggil antrian');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setActionLoading('');
    }
  };

  const handleCompleteQueue = async (queueId) => {
    setActionLoading(queueId);
    try {
      const response = await queueAPI.completeQueue(queueId);
      setMessage(response.data.message);
      await fetchQueues();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Gagal menyelesaikan antrian');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setActionLoading('');
    }
  };

  const handleCancelQueue = async (queueId) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan antrian ini?')) return;
    
    setActionLoading(queueId);
    try {
      const response = await queueAPI.updateQueueStatus(queueId, { status: 'cancelled' });
      setMessage(response.data.message);
      await fetchQueues();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Gagal membatalkan antrian');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setActionLoading('');
    }
  };

  const loadPatients = async () => {
    try {
      const response = await adminAPI.getAllPatients();
      setPatients(response.data.data.patients || []);
    } catch (error) {
      console.error('Error loading patients:', error);
      setPatients([]);
    }
  };

  const handleAddManualQueue = () => {
    setShowAddModal(true);
    setSelectedPatient(null);
    setSearchPatient('');
  };

  const handleBookQueue = async () => {
    if (!selectedPatient) {
      setMessage('Pilih pasien terlebih dahulu');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setBookingLoading(true);
    try {
      const response = await queueAPI.bookQueueForPatient({
        appointmentDate: selectedDate,
        patientId: selectedPatient.id,
        notes: `Antrian dibuat manual oleh admin untuk ${selectedPatient.fullName}`
      });

      setMessage(`Antrian berhasil dibuat untuk ${selectedPatient.fullName} - Nomor Antrian: ${response.data.data.queueNumber}`);
      setShowAddModal(false);
      fetchQueues(); // Refresh queue list
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Error booking queue:', error);
      setMessage(error.response?.data?.message || 'Gagal membuat antrian');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => 
    patient.fullName?.toLowerCase().includes(searchPatient.toLowerCase()) ||
    patient.phoneNumber?.includes(searchPatient)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'in_service':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'emergency_cancelled':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'waiting':
        return '⏳';
      case 'in_service':
        return '🔄';
      case 'completed':
        return '✅';
      case 'cancelled':
        return '❌';
      case 'emergency_cancelled':
        return '⚠️';
      default:
        return '❓';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'waiting':
        return 'Menunggu';
      case 'in_service':
        return 'Sedang Dilayani';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      case 'emergency_cancelled':
        return 'Dibatalkan (Darurat)';
      default:
        return status;
    }
  };

  const filteredQueues = queues.filter(queue => {
    if (filter === 'all') return true;
    return queue.status === filter;
  });

  const QueueItem = ({ queue, index }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            {queue.queueNumber}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{queue.patient?.fullName || 'Nama tidak tersedia'}</h3>
            <p className="text-gray-600">{queue.patient?.phoneNumber}</p>
            <p className="text-sm text-gray-500">Tanggal: {new Date(queue.appointmentDate).toLocaleDateString('id-ID')}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(queue.status)}`}>
            {getStatusIcon(queue.status)} {getStatusLabel(queue.status)}
          </span>
          
          <div className="flex space-x-2">
            {queue.status === 'waiting' && (
              <>
                <button 
                  onClick={() => handleCallQueue(queue.id)}
                  disabled={actionLoading === queue.id}
                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors duration-200 disabled:opacity-50" 
                  title="Panggil"
                >
                  {actionLoading === queue.id ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 15h9a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </>
            )}
            
            {queue.status === 'in_service' && (
              <button 
                onClick={() => handleCompleteQueue(queue.id)}
                disabled={actionLoading === queue.id}
                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200 disabled:opacity-50" 
                title="Selesaikan"
              >
                {actionLoading === queue.id ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )}
            
            {(queue.status === 'waiting' || queue.status === 'in_service') && (
              <button 
                onClick={() => handleCancelQueue(queue.id)}
                disabled={actionLoading === queue.id}
                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200 disabled:opacity-50" 
                title="Batalkan"
              >
                {actionLoading === queue.id ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ⚡ Kelola Antrian
            </h1>
            <p className="text-gray-600 mt-2">Kelola dan pantau semua antrian pasien</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button 
              onClick={handleAddManualQueue}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              ➕ Tambah Antrian
            </button>
          </div>
        </div>
        
        {/* Message Alert */}
        {message && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-medium">{message}</p>
          </div>
        )}
      </div>

      {/* Filters & Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Semua', icon: '📋' },
              { key: 'waiting', label: 'Menunggu', icon: '⏳' },
              { key: 'in_service', label: 'Sedang Dilayani', icon: '🔄' },
              { key: 'completed', label: 'Selesai', icon: '✅' },
              { key: 'cancelled', label: 'Dibatalkan', icon: '❌' },
              { key: 'emergency_cancelled', label: 'Dibatalkan (Darurat)', icon: '⚠️' }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === filterOption.key
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{filterOption.icon}</span>
                <span>{filterOption.label}</span>
                <span className="bg-white px-2 py-1 rounded-full text-xs">
                  {filterOption.key === 'all' ? queues.length : queues.filter(q => q.status === filterOption.key).length}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={fetchQueues}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Queue List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Memuat antrian...</p>
            </div>
          </div>
        ) : filteredQueues.length > 0 ? (
          filteredQueues.map((queue, index) => (
            <QueueItem key={queue.id} queue={queue} index={index} />
          ))
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Tidak ada antrian</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? `Belum ada antrian untuk tanggal ${new Date(selectedDate).toLocaleDateString('id-ID')}`
                : `Tidak ada antrian dengan status "${getStatusLabel(filter)}"`
              }
            </p>
            <button 
              onClick={handleAddManualQueue}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              ➕ Tambah Antrian Baru
            </button>
          </div>
        )}
      </div>

      {/* Manual Queue Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">➕ Tambah Antrian Manual</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Selected Date Info */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">📅 Tanggal Antrian</h3>
                <p className="text-blue-700">{new Date(selectedDate).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>

              {/* Patient Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🔍 Cari Pasien</label>
                <input
                  type="text"
                  placeholder="Ketik nama atau nomor telepon pasien..."
                  value={searchPatient}
                  onChange={(e) => setSearchPatient(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Patient List */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">👥 Pilih Pasien</h3>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredPatients.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {searchPatient ? 'Tidak ada pasien yang ditemukan' : 'Memuat daftar pasien...'}
                    </div>
                  ) : (
                    filteredPatients.map((patient) => (
                      <button
                        key={patient.id}
                        onClick={() => setSelectedPatient(patient)}
                        className={`w-full p-4 rounded-xl border transition-all duration-200 text-left ${
                          selectedPatient?.id === patient.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{patient.fullName}</div>
                            <div className="text-sm text-gray-600">{patient.phoneNumber}</div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedPatient?.id === patient.id
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedPatient?.id === patient.id && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Selected Patient Preview */}
              {selectedPatient && (
                <div className="bg-green-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Pasien Terpilih</h3>
                  <p className="text-green-700">
                    <strong>{selectedPatient.fullName}</strong> - {selectedPatient.phoneNumber}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex space-x-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleBookQueue}
                disabled={!selectedPatient || bookingLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                    Membuat Antrian...
                  </div>
                ) : (
                  '➕ Buat Antrian'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQueueManagement;