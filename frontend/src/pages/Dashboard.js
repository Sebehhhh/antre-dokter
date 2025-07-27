import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { queueAPI } from '../utils/api';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // If user is admin, show admin dashboard
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }
  const [myQueues, setMyQueues] = useState([]);
  const [currentQueue, setCurrentQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
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

    try {
      await queueAPI.cancelQueue(queueId);
      loadDashboardData();
      alert('Antrian berhasil dibatalkan');
    } catch (error) {
      console.error('Error canceling queue:', error);
      alert(error.response?.data?.message || 'Gagal membatalkan antrian');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      waiting: 'bg-yellow-100 text-yellow-800',
      in_service: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      waiting: 'Menunggu',
      in_service: 'Dalam Pelayanan',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
      no_show: 'Tidak Hadir'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard {user.role === 'patient' ? 'Pasien' : 'Admin'}
        </h1>
        {user.role === 'patient' && (
          <a 
            href="/book-queue" 
            className="btn-primary"
          >
            Buat Antrian Baru
          </a>
        )}
      </div>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Status Antrian Hari Ini</h2>
          
          {currentQueue?.currentQueue ? (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-600 font-medium">Sedang Dilayani:</p>
              <p className="text-lg font-bold text-blue-800">
                Nomor {currentQueue.currentQueue.queueNumber} - {currentQueue.currentQueue.patient?.fullName}
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-gray-600">Belum ada yang sedang dilayani</p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Antrian Menunggu: {currentQueue?.totalWaiting || 0}
            </p>
            
            {currentQueue?.waitingQueues?.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Daftar Menunggu:</p>
                <div className="max-h-40 overflow-y-auto">
                  {currentQueue.waitingQueues.map(queue => (
                    <div key={queue.id} className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm">
                        Nomor {queue.queueNumber} - {queue.patient?.fullName}
                      </span>
                      {getStatusBadge(queue.status)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Antrian Saya</h2>
          
          {myQueues.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Belum ada antrian</p>
              {user.role === 'patient' && (
                <a href="/book-queue" className="btn-primary mt-4 inline-block">
                  Buat Antrian Sekarang
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {myQueues.map(queue => (
                <div key={queue.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">Nomor Antrian: {queue.queueNumber}</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(queue.appointmentDate)} - {queue.appointmentTime}
                      </p>
                    </div>
                    {getStatusBadge(queue.status)}
                  </div>
                  
                  {queue.status === 'waiting' && user.role === 'patient' && (
                    <button
                      onClick={() => handleCancelQueue(queue.id)}
                      className="btn-danger text-sm mt-2"
                    >
                      Batalkan
                    </button>
                  )}
                  
                  {queue.notes && (
                    <p className="text-sm text-gray-600 mt-2">
                      Catatan: {queue.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;