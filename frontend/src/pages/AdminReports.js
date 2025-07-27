import React, { useState, useEffect } from 'react';
import { queueAPI } from '../utils/api';
import { getWitaDateString, addDaysToWitaDate } from '../utils/timezone';

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState({
    daily: null,
    weekly: null,
    monthly: null
  });
  const [dateRange, setDateRange] = useState({
    startDate: addDaysToWitaDate(-7), // 7 days ago to catch recent data
    endDate: getWitaDateString() // today
  });

  useEffect(() => {
    // Only fetch reports on initial load
    fetchReports();
  }, []); // Only run once on mount

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Use the new reports API endpoint that handles date ranges
      const response = await queueAPI.getReportsByDateRange(dateRange.startDate, dateRange.endDate);
      const reportData = response.data.data || response.data;
      
      // Transform API response to match component structure
      const reportsData = {
        daily: (reportData.queues && reportData.queues.length > 0) ? {
          date: `${reportData.startDate} to ${reportData.endDate}`,
          stats: reportData.totalStats,
          queues: reportData.queues
        } : null,
        period: {
          startDate: reportData.startDate || dateRange.startDate,
          endDate: reportData.endDate || dateRange.endDate,
          totalDays: reportData.totalDays || 0,
          activeDays: reportData.activeDays || 0,
          summary: reportData.totalStats || { total: 0, completed: 0, waiting: 0, in_service: 0, cancelled: 0, no_show: 0 },
          dailyBreakdown: reportData.dailyStats ? Object.keys(reportData.dailyStats).map(date => ({
            date,
            stats: reportData.dailyStats[date],
            queueCount: reportData.dailyStats[date].total
          })) : [],
          averagePerDay: {
            total: (reportData.activeDays && reportData.totalStats) ? Math.round(reportData.totalStats.total / reportData.activeDays) : 0,
            completed: (reportData.activeDays && reportData.totalStats) ? Math.round(reportData.totalStats.completed / reportData.activeDays) : 0,
            waiting: (reportData.activeDays && reportData.totalStats) ? Math.round(reportData.totalStats.waiting / reportData.activeDays) : 0,
            in_service: (reportData.activeDays && reportData.totalStats) ? Math.round(reportData.totalStats.in_service / reportData.activeDays) : 0
          }
        }
      };
      
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
      // Show error state but don't crash
      setReports({
        daily: null,
        period: null,
        error: 'Gagal memuat laporan. Silakan coba lagi.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateDateRange = () => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (start > end) {
      return { isValid: false, message: 'Tanggal mulai tidak boleh lebih besar dari tanggal akhir' };
    }
    
    if (diffDays > 30) {
      return { isValid: false, message: 'Periode maksimal 30 hari' };
    }
    
    return { isValid: true, message: '' };
  };

  const validation = validateDateRange();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            📊 Laporan
          </h1>
          <p className="text-gray-600 mt-2">Analisis dan laporan aktivitas praktik</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat laporan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          📊 Laporan
        </h1>
        <p className="text-gray-600 mt-2">Analisis dan laporan aktivitas praktik</p>
      </div>

      {/* Filter Date Range */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">🗓️ Filter Periode</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Akhir</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchReports}
              disabled={loading || !validation.isValid}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                  Generating...
                </span>
              ) : (
                '📊 Generate Laporan'
              )}
            </button>
          </div>
        </div>
        
        {/* Validation Message */}
        {!validation.isValid && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800 text-sm mt-4">
            ⚠️ {validation.message}
          </div>
        )}
        
        {/* Info Message */}
        {validation.isValid && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800 text-sm mt-4">
            ℹ️ Periode: {dateRange.startDate === dateRange.endDate ? '1 hari' : `${Math.ceil((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24)) + 1} hari`} | Klik tombol untuk generate laporan
          </div>
        )}
      </div>

      {/* Error Display */}
      {reports.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <span className="text-red-500 text-2xl">❌</span>
            <div>
              <h3 className="text-lg font-semibold text-red-800">Terjadi Kesalahan</h3>
              <p className="text-red-600">{reports.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Period Summary Stats */}
      {reports.period && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            📊 Laporan Periode: {reports.period.startDate === reports.period.endDate ? reports.period.startDate : `${reports.period.startDate} s/d ${reports.period.endDate}`}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Total Summary */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">📈 Total ({reports.period.activeDays || reports.period.totalDays} hari)</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-blue-600">{reports.period.summary.total}</div>
                  <div className="text-xs text-blue-800">Total Antrian</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-green-600">{reports.period.summary.completed}</div>
                  <div className="text-xs text-green-800">Selesai</div>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-red-600">{(reports.period.summary.cancelled || 0) + (reports.period.summary.no_show || 0)}</div>
                  <div className="text-xs text-red-800">Dibatalkan</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-purple-600">{reports.period.activeDays || reports.period.totalDays}</div>
                  <div className="text-xs text-purple-800">Hari Aktif</div>
                </div>
              </div>
            </div>

            {/* Average Per Day */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">📊 Rata-rata per Hari</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-indigo-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-indigo-600">{reports.period.averagePerDay.total}</div>
                  <div className="text-xs text-indigo-800">Antrian/hari</div>
                </div>
                <div className="bg-teal-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-teal-600">{reports.period.averagePerDay.completed}</div>
                  <div className="text-xs text-teal-800">Selesai/hari</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-yellow-600">
                    {reports.period.summary.total > 0 ? Math.round((reports.period.summary.completed / reports.period.summary.total) * 100) : 0}%
                  </div>
                  <div className="text-xs text-yellow-800">Tingkat Selesai</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-orange-600">
                    {reports.period.summary.total > 0 ? Math.round((((reports.period.summary.cancelled || 0) + (reports.period.summary.no_show || 0)) / reports.period.summary.total) * 100) : 0}%
                  </div>
                  <div className="text-xs text-orange-800">Tingkat Batal</div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Breakdown */}
          {reports.period.dailyBreakdown && reports.period.dailyBreakdown.length > 1 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">📅 Breakdown Harian</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {reports.period.dailyBreakdown.map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-700">
                        {new Date(day.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <span className="text-blue-600">Total: {day.stats.total || 0}</span>
                      <span className="text-green-600">Selesai: {day.stats.completed || 0}</span>
                      <span className="text-yellow-600">Menunggu: {day.stats.waiting || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Daily Stats */}
      {reports.daily && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📈 Detail Antrian ({reports.daily.date})</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{reports.daily.stats.total}</div>
              <div className="text-sm text-blue-800">Total Antrian</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{reports.daily.stats.completed}</div>
              <div className="text-sm text-green-800">Selesai</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{reports.daily.stats.waiting}</div>
              <div className="text-sm text-yellow-800">Menunggu</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{reports.daily.stats.in_service}</div>
              <div className="text-sm text-purple-800">Sedang Dilayani</div>
            </div>
          </div>

          {/* Queue List Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">📋 Ringkasan Antrian</h3>
            {reports.daily.queues && reports.daily.queues.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {reports.daily.queues.map((queue, index) => (
                  <div key={queue.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                        {queue.queueNumber}
                      </span>
                      <span className="font-medium">{queue.patient?.fullName || 'Unknown'}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      queue.status === 'completed' ? 'bg-green-100 text-green-800' :
                      queue.status === 'in_service' ? 'bg-purple-100 text-purple-800' :
                      queue.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {queue.status === 'completed' ? 'Selesai' :
                       queue.status === 'in_service' ? 'Dilayani' :
                       queue.status === 'waiting' ? 'Menunggu' :
                       queue.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Tidak ada antrian untuk periode ini</p>
            )}
          </div>
        </div>
      )}

      {/* Future Reports Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">🚀 Fitur Laporan Mendatang</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-medium text-gray-800">Grafik Mingguan</h3>
            <p className="text-sm text-gray-500 mt-1">Tren antrian per minggu</p>
          </div>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">📈</div>
            <h3 className="font-medium text-gray-800">Laporan Bulanan</h3>
            <p className="text-sm text-gray-500 mt-1">Statistik kinerja bulanan</p>
          </div>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-medium text-gray-800">Analisis Finansial</h3>
            <p className="text-sm text-gray-500 mt-1">Proyeksi pendapatan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;