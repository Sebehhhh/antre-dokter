import React, { useState, useEffect } from 'react';
import { queueAPI, adminAPI } from '../utils/api';
import { getWitaDateString } from '../utils/timezone';

const AdminDashboard = () => {
  const [currentQueue, setCurrentQueue] = useState(null);
  const [todayStats, setTodayStats] = useState({
    total: 0,
    waiting: 0,
    inService: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [message, setMessage] = useState('');
  const [recentActivities, setRecentActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentActivities();
    // Refresh data every 10 seconds for real-time updates
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchRecentActivities();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = getWitaDateString();
      
      const [currentResponse, todayResponse] = await Promise.all([
        queueAPI.getCurrentQueue(),
        queueAPI.getQueuesByDate(today)
      ]);
      
      setCurrentQueue(currentResponse.data.data);
      
      // Get today's statistics
      const todayData = todayResponse.data.data;
      setTodayStats({
        total: todayData.stats.total,
        waiting: todayData.stats.waiting,
        inService: todayData.stats.in_service,
        completed: todayData.stats.completed
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    setActivitiesLoading(true);
    try {
      const response = await adminAPI.getRecentActivities({ limit: 10 });
      setRecentActivities(response.data.data.activities || []);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setRecentActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const handleCallNext = async () => {
    setActionLoading('call');
    try {
      const response = await queueAPI.callNextQueue();
      setMessage(response.data.message);
      await fetchDashboardData();
      await fetchRecentActivities();
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Gagal memanggil antrian berikutnya');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setActionLoading('');
    }
  };

  const handleCompleteQueue = async () => {
    if (!currentQueue?.currentQueue) return;
    
    setActionLoading('complete');
    try {
      const response = await queueAPI.completeQueue(currentQueue.currentQueue.id);
      setMessage(response.data.message);
      await fetchDashboardData();
      await fetchRecentActivities();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Gagal menyelesaikan antrian');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setActionLoading('');
    }
  };

  const handleRefresh = async () => {
    setActionLoading('refresh');
    await fetchDashboardData();
    await fetchRecentActivities();
    setActionLoading('');
  };

  const StatCard = ({ title, value, icon, color, subtext }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold ${color} mt-1`}>{value}</p>
          {subtext && <p className="text-gray-500 text-xs mt-1">{subtext}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color === 'text-blue-600' ? 'bg-blue-100' : color === 'text-green-600' ? 'bg-green-100' : color === 'text-yellow-600' ? 'bg-yellow-100' : 'bg-purple-100'}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const QueueCard = ({ queue, isCurrentlyServed = false }) => (
    <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
      isCurrentlyServed 
        ? 'border-green-200 bg-green-50' 
        : 'border-gray-200 bg-white hover:border-blue-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
            isCurrentlyServed ? 'bg-green-500' : 'bg-blue-500'
          }`}>
            {queue.queueNumber}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{queue.patient?.fullName || 'Nama tidak tersedia'}</p>
            <p className="text-sm text-gray-600">Antrian #{queue.queueNumber}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            isCurrentlyServed 
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {isCurrentlyServed ? '🔄 Sedang Dilayani' : '⏳ Menunggu'}
          </span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              🏠 Dashboard Admin
            </h1>
            <p className="text-gray-600 mt-2">Kelola antrian dan pantau aktivitas praktik</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Hari ini</p>
            <p className="text-lg font-semibold text-gray-800">
              {new Date().toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
        
        {/* Message Alert */}
        {message && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-medium">{message}</p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Antrian Hari Ini"
          value={todayStats.total}
          icon="📋"
          color="text-blue-600"
          subtext="Semua antrian"
        />
        <StatCard
          title="Sedang Menunggu"
          value={todayStats.waiting}
          icon="⏳"
          color="text-yellow-600"
          subtext="Dalam antrian"
        />
        <StatCard
          title="Sedang Dilayani"
          value={todayStats.inService}
          icon="🔄"
          color="text-green-600"
          subtext="Pasien aktif"
        />
        <StatCard
          title="Selesai Hari Ini"
          value={todayStats.completed}
          icon="✅"
          color="text-purple-600"
          subtext="Pasien selesai"
        />
      </div>

      {/* Current Queue & Waiting List */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Current Queue */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">🔄 Antrian Aktif</h2>
              <button 
                onClick={handleRefresh}
                disabled={actionLoading === 'refresh'}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors duration-200 disabled:opacity-50"
              >
                {actionLoading === 'refresh' ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {currentQueue?.currentQueue ? (
              <QueueCard queue={currentQueue.currentQueue} isCurrentlyServed={true} />
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">😴</span>
                </div>
                <p className="text-gray-600 font-medium">Tidak ada pasien yang sedang dilayani</p>
                <p className="text-gray-500 text-sm mt-1">Panggil antrian berikutnya untuk memulai</p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-6 flex space-x-3">
              <button 
                onClick={handleCallNext}
                disabled={actionLoading === 'call' || currentQueue?.currentQueue}
                className="flex-1 py-3 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'call' ? '⏳ Memanggil...' : '▶️ Panggil Berikutnya'}
              </button>
              <button 
                onClick={handleCompleteQueue}
                disabled={actionLoading === 'complete' || !currentQueue?.currentQueue}
                className="flex-1 py-3 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'complete' ? '⏳ Proses...' : '✅ Selesaikan'}
              </button>
            </div>
          </div>
        </div>

        {/* Waiting List */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">⏳ Daftar Tunggu</h2>

            {currentQueue?.waitingQueues?.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {currentQueue.waitingQueues.slice(0, 10).map((queue) => (
                  <QueueCard key={queue.id} queue={queue} />
                ))}
                {currentQueue.waitingQueues.length > 10 && (
                  <div className="text-center py-3">
                    <p className="text-gray-500 text-sm">
                      +{currentQueue.waitingQueues.length - 10} antrian lainnya
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">📝</span>
                </div>
                <p className="text-gray-600 font-medium">Tidak ada antrian</p>
                <p className="text-gray-500 text-sm mt-1">Semua pasien sudah dilayani</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">📊 Aktivitas Terbaru</h2>
          <button 
            onClick={fetchRecentActivities}
            disabled={activitiesLoading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
          >
            {activitiesLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        <div className="space-y-4">
          {activitiesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2 text-sm">Memuat aktivitas...</p>
            </div>
          ) : recentActivities.length > 0 ? (
            recentActivities.map((activity) => {
              const getActivityIcon = (type) => {
                const icons = {
                  queue_created: '➕',
                  queue_called: '📢',
                  queue_completed: '✅',
                  queue_cancelled: '❌',
                  queue_no_show: '👻',
                  user_registered: '👤',
                  user_login: '🔑',
                  settings_updated: '⚙️'
                };
                return icons[type] || '📋';
              };

              const getActivityColor = (type) => {
                const colors = {
                  queue_created: 'bg-blue-50 text-blue-600',
                  queue_called: 'bg-yellow-50 text-yellow-600',
                  queue_completed: 'bg-green-50 text-green-600',
                  queue_cancelled: 'bg-red-50 text-red-600',
                  queue_no_show: 'bg-gray-50 text-gray-600',
                  user_registered: 'bg-purple-50 text-purple-600',
                  user_login: 'bg-indigo-50 text-indigo-600',
                  settings_updated: 'bg-orange-50 text-orange-600'
                };
                return colors[type] || 'bg-gray-50 text-gray-600';
              };

              const formatActivityTime = (createdAt) => {
                const now = new Date();
                const activityTime = new Date(createdAt);
                const diffMs = now - activityTime;
                const diffMins = Math.floor(diffMs / (1000 * 60));
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

                if (diffMins < 1) return 'Baru saja';
                if (diffMins < 60) return `${diffMins} menit yang lalu`;
                if (diffHours < 24) return `${diffHours} jam yang lalu`;
                if (diffDays < 7) return `${diffDays} hari yang lalu`;
                
                return activityTime.toLocaleDateString('id-ID');
              };

              return (
                <div key={activity.id} className={`flex items-center space-x-4 p-3 rounded-lg ${getActivityColor(activity.type).split(' ')[0]}`}>
                  <div className={`w-8 h-8 ${getActivityColor(activity.type).split(' ')[0].replace('50', '100')} rounded-full flex items-center justify-center`}>
                    <span className={`${getActivityColor(activity.type).split(' ')[1]} text-sm`}>
                      {getActivityIcon(activity.type)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatActivityTime(activity.createdAt)}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">📊</span>
              </div>
              <p className="text-gray-600 font-medium">Belum ada aktivitas</p>
              <p className="text-gray-500 text-sm mt-1">Aktivitas akan muncul di sini</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;