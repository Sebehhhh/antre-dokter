import React, { useState, useEffect } from 'react';
import { queueAPI } from '../utils/api';

const AdminQueueManagement = () => {
  const [queues, setQueues] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [filter, setFilter] = useState('all'); // all, waiting, in_service, completed, cancelled
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchQueues();
  }, [selectedDate]);

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
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium">
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
              { key: 'cancelled', label: 'Dibatalkan', icon: '❌' }
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
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium">
              ➕ Tambah Antrian Baru
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQueueManagement;