import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { queueAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const PatientHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, waiting, completed, cancelled
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    loadQueueHistory();
  }, []);

  const loadQueueHistory = async () => {
    try {
      setLoading(true);
      const response = await queueAPI.getMyQueues();
      setQueues(response.data.data.queues || []);
      setError('');
    } catch (error) {
      console.error('Error loading queue history:', error);
      setError('Gagal memuat riwayat antrian');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelQueue = async (queueId) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan antrian ini?')) {
      return;
    }

    setActionLoading('cancel-' + queueId);
    try {
      await queueAPI.cancelQueue(queueId);
      await loadQueueHistory();
      alert('Antrian berhasil dibatalkan');
    } catch (error) {
      console.error('Error canceling queue:', error);
      alert(error.response?.data?.message || 'Gagal membatalkan antrian');
    } finally {
      setActionLoading('');
    }
  };

  const getStatusConfig = (status) => {
    const config = {
      waiting: { 
        bg: 'bg-yellow-50 border-yellow-200', 
        text: 'text-yellow-700', 
        icon: '⏳', 
        label: 'Menunggu',
        color: 'yellow'
      },
      in_service: { 
        bg: 'bg-blue-50 border-blue-200', 
        text: 'text-blue-700', 
        icon: '🔄', 
        label: 'Sedang Dilayani',
        color: 'blue'
      },
      completed: { 
        bg: 'bg-green-50 border-green-200', 
        text: 'text-green-700', 
        icon: '✅', 
        label: 'Selesai',
        color: 'green'
      },
      cancelled: { 
        bg: 'bg-red-50 border-red-200', 
        text: 'text-red-700', 
        icon: '❌', 
        label: 'Dibatalkan',
        color: 'red'
      },
      emergency_cancelled: { 
        bg: 'bg-orange-50 border-orange-200', 
        text: 'text-orange-700', 
        icon: '⚠️', 
        label: 'Dibatalkan (Darurat)',
        color: 'orange'
      },
      no_show: { 
        bg: 'bg-gray-50 border-gray-200', 
        text: 'text-gray-700', 
        icon: '👻', 
        label: 'Tidak Hadir',
        color: 'gray'
      }
    };

    return config[status] || config.waiting;
  };

  const getStatusBadge = (status) => {
    const statusConfig = getStatusConfig(status);

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.bg} ${statusConfig.text}`}>
        <span>{statusConfig.icon}</span>
        {statusConfig.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      full: date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      short: date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    };
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredQueues = queues.filter(queue => {
    if (filter === 'all') return true;
    return queue.status === filter;
  });

  const getFilterStats = () => {
    return {
      all: queues.length,
      waiting: queues.filter(q => q.status === 'waiting').length,
      completed: queues.filter(q => q.status === 'completed').length,
      cancelled: queues.filter(q => q.status === 'cancelled').length
    };
  };

  const stats = getFilterStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Memuat riwayat antrian...</p>
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
                📚 Riwayat Antrian
              </h1>
              <p className="text-gray-600 mt-2">Lihat semua riwayat antrian Anda</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Kembali</span>
              </button>
              <button
                onClick={loadQueueHistory}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors duration-200 disabled:opacity-50"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
              <button
                onClick={() => navigate('/book-queue')}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Buat Antrian</span>
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

        {/* Filter & Stats */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'all', label: 'Semua', icon: '📋', count: stats.all },
                { key: 'waiting', label: 'Menunggu', icon: '⏳', count: stats.waiting },
                { key: 'completed', label: 'Selesai', icon: '✅', count: stats.completed },
                { key: 'cancelled', label: 'Dibatalkan', icon: '❌', count: stats.cancelled }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    filter === filterOption.key
                      ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200'
                  }`}
                >
                  <span>{filterOption.icon}</span>
                  <span>{filterOption.label}</span>
                  <span className="bg-white px-2 py-1 rounded-full text-xs font-bold">
                    {filterOption.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="text-sm text-gray-600">
              Total: <span className="font-semibold">{filteredQueues.length}</span> antrian
            </div>
          </div>
        </div>

        {/* Queue History */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          {filteredQueues.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">
                  {filter === 'all' ? '📝' : getStatusConfig(filter).icon}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {filter === 'all' ? 'Belum ada riwayat antrian' : `Tidak ada antrian ${getStatusConfig(filter).label.toLowerCase()}`}
              </h3>
              <p className="text-gray-600 mb-8">
                {filter === 'all' 
                  ? 'Buat antrian pertama Anda sekarang!' 
                  : `Belum ada antrian dengan status ${getStatusConfig(filter).label.toLowerCase()}`
                }
              </p>
              {filter === 'all' && (
                <button
                  onClick={() => navigate('/book-queue')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                  🎫 Buat Antrian Sekarang
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQueues.map(queue => {
                const statusConfig = getStatusConfig(queue.status);
                const dateFormatted = formatDate(queue.appointmentDate);
                
                return (
                  <div key={queue.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                      <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                        <div className={`w-16 h-16 bg-gradient-to-br from-${statusConfig.color}-500 to-${statusConfig.color}-600 rounded-xl flex items-center justify-center text-white font-bold text-xl`}>
                          {queue.queueNumber}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-800 text-lg">Antrian #{queue.queueNumber}</h3>
                            {getStatusBadge(queue.status)}
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p className="flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="font-medium">{dateFormatted.full}</span>
                            </p>
                            <p className="flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Dibuat: {formatTime(queue.createdAt)}
                            </p>
                            {queue.serviceStartedAt && (
                              <p className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Mulai dilayani: {formatTime(queue.serviceStartedAt)}
                              </p>
                            )}
                            {queue.serviceCompletedAt && (
                              <p className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Selesai: {formatTime(queue.serviceCompletedAt)}
                                {queue.actualServiceTime && (
                                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                    {queue.actualServiceTime} menit
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {queue.status === 'waiting' && (
                          <button
                            onClick={() => handleCancelQueue(queue.id)}
                            disabled={actionLoading === 'cancel-' + queue.id}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors duration-200 disabled:opacity-50 text-sm font-medium"
                          >
                            {actionLoading === 'cancel-' + queue.id ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-700 border-t-transparent"></div>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                            <span>Batalkan</span>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {queue.notes && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Catatan:</span> {queue.notes}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientHistory;