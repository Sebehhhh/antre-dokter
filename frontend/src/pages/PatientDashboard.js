import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { queueAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myQueues, setMyQueues] = useState([]);
  const [currentQueue, setCurrentQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    loadDashboardData();
    // Auto refresh every 30 seconds for real-time updates
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [myQueuesResponse, currentQueueResponse] = await Promise.all([
        queueAPI.getMyQueues(),
        queueAPI.getCurrentQueue()
      ]);

      setMyQueues(myQueuesResponse.data.data.queues);
      setCurrentQueue(currentQueueResponse.data.data);
      setError('');
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Gagal memuat data dashboard');
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
      await loadDashboardData();
      alert('Antrian berhasil dibatalkan');
    } catch (error) {
      console.error('Error canceling queue:', error);
      alert(error.response?.data?.message || 'Gagal membatalkan antrian');
    } finally {
      setActionLoading('');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      waiting: { 
        bg: 'bg-yellow-50 border-yellow-200', 
        text: 'text-yellow-700', 
        icon: '⏳', 
        label: 'Menunggu' 
      },
      in_service: { 
        bg: 'bg-blue-50 border-blue-200', 
        text: 'text-blue-700', 
        icon: '🔄', 
        label: 'Sedang Dilayani' 
      },
      completed: { 
        bg: 'bg-green-50 border-green-200', 
        text: 'text-green-700', 
        icon: '✅', 
        label: 'Selesai' 
      },
      cancelled: { 
        bg: 'bg-red-50 border-red-200', 
        text: 'text-red-700', 
        icon: '❌', 
        label: 'Dibatalkan' 
      },
      emergency_cancelled: { 
        bg: 'bg-orange-50 border-orange-200', 
        text: 'text-orange-700', 
        icon: '⚠️', 
        label: 'Dibatalkan (Darurat)' 
      },
      no_show: { 
        bg: 'bg-gray-50 border-gray-200', 
        text: 'text-gray-700', 
        icon: '👻', 
        label: 'Tidak Hadir' 
      }
    };

    const statusConfig = config[status] || config.waiting;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.bg} ${statusConfig.text}`}>
        <span>{statusConfig.icon}</span>
        {statusConfig.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMyActiveQueue = () => {
    return myQueues.find(queue => queue.status === 'waiting' || queue.status === 'in_service');
  };

  const getQueuePosition = (myQueueNumber) => {
    if (!currentQueue?.waitingQueues) return null;
    const position = currentQueue.waitingQueues.findIndex(q => q.queueNumber === myQueueNumber);
    return position >= 0 ? position + 1 : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  const activeQueue = getMyActiveQueue();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                👋 Selamat Datang, {user?.fullName}
              </h1>
              <p className="text-gray-600 mt-2">Dashboard pasien - Kelola antrian Anda dengan mudah</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button
                onClick={loadDashboardData}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
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

        {/* Active Queue Status */}
        {activeQueue && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">🎯 Antrian Aktif Anda</h2>
              {getStatusBadge(activeQueue.status)}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Nomor Antrian</p>
                    <p className="text-3xl font-bold">{activeQueue.queueNumber}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🎫</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Sedang Dilayani</p>
                    <p className="text-2xl font-bold">
                      {currentQueue?.currentQueue ? `#${currentQueue.currentQueue.queueNumber}` : 'Belum ada'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🔄</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Posisi Anda</p>
                    <p className="text-2xl font-bold">
                      {activeQueue.status === 'in_service' 
                        ? 'Sedang Dilayani' 
                        : getQueuePosition(activeQueue.queueNumber) 
                          ? `Urutan ke-${getQueuePosition(activeQueue.queueNumber)}` 
                          : 'Menunggu'
                      }
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📍</span>
                  </div>
                </div>
              </div>
            </div>

            {activeQueue.status === 'waiting' && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start">
                  <span className="text-yellow-500 text-xl mr-3">💡</span>
                  <div>
                    <p className="text-yellow-800 font-medium">Tips Menunggu:</p>
                    <p className="text-yellow-700 text-sm mt-1">
                      Pastikan Anda berada di area klinik saat nomor antrian Anda dipanggil. 
                      Estimasi waktu tunggu: {getQueuePosition(activeQueue.queueNumber) ? (getQueuePosition(activeQueue.queueNumber) * 15) : 15} menit.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeQueue.status === 'waiting' && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleCancelQueue(activeQueue.id)}
                  disabled={actionLoading === 'cancel-' + activeQueue.id}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors duration-200 disabled:opacity-50"
                >
                  {actionLoading === 'cancel-' + activeQueue.id ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-700 border-t-transparent"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span>Batalkan Antrian</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Current Queue Info */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">📊 Status Antrian Hari Ini</h2>
            
            {currentQueue?.currentQueue ? (
              <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-xl p-4 mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {currentQueue.currentQueue.queueNumber}
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">Sedang Dilayani:</p>
                    <p className="text-green-800 font-semibold">{currentQueue.currentQueue.patient?.fullName}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white mr-4">
                    <span className="text-xl">😴</span>
                  </div>
                  <p className="text-gray-600">Belum ada yang sedang dilayani</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-yellow-700 font-medium">Antrian Menunggu</span>
                <span className="text-yellow-800 font-bold text-lg">{currentQueue?.totalWaiting || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">📋 Daftar Tunggu</h2>
            
            {currentQueue?.waitingQueues?.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {currentQueue.waitingQueues.slice(0, 8).map((queue, index) => (
                  <div key={queue.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                        {queue.queueNumber}
                      </div>
                      <span className="text-gray-700 text-sm">{queue.patient?.fullName}</span>
                    </div>
                    <span className="text-xs text-gray-500">Urutan ke-{index + 1}</span>
                  </div>
                ))}
                {currentQueue.waitingQueues.length > 8 && (
                  <div className="text-center py-2">
                    <p className="text-gray-500 text-sm">+{currentQueue.waitingQueues.length - 8} antrian lainnya</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <p className="text-gray-600 font-medium">Tidak ada antrian menunggu</p>
                <p className="text-gray-500 text-sm mt-1">Semua pasien sudah dilayani</p>
              </div>
            )}
          </div>
        </div>

        {/* Queue History */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">📚 Riwayat Antrian Saya</h2>
            <button
              onClick={() => navigate('/history')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
            >
              <span>Lihat Semua</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {myQueues.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Belum ada riwayat antrian</h3>
              <p className="text-gray-600 mb-6">Buat antrian pertama Anda sekarang!</p>
              <button
                onClick={() => navigate('/book-queue')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                🎫 Buat Antrian Sekarang
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {myQueues.slice(0, 3).map(queue => (
                <div key={queue.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex items-center space-x-4 mb-3 md:mb-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                        {queue.queueNumber}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Antrian #{queue.queueNumber}</p>
                        <p className="text-sm text-gray-600">{formatDate(queue.appointmentDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(queue.status)}
                      {queue.status === 'waiting' && (
                        <button
                          onClick={() => handleCancelQueue(queue.id)}
                          disabled={actionLoading === 'cancel-' + queue.id}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 disabled:opacity-50 text-sm"
                        >
                          {actionLoading === 'cancel-' + queue.id ? (
                            <div className="w-3 h-3 animate-spin rounded-full border border-red-700 border-t-transparent"></div>
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          <span>Batalkan</span>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {queue.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Catatan:</span> {queue.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              
              {myQueues.length > 3 && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => navigate('/history')}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Lihat {myQueues.length - 3} antrian lainnya →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;