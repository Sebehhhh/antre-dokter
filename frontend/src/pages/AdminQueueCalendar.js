import React, { useState, useEffect } from 'react';
import { queueAPI } from '../utils/api';

const AdminQueueCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  });
  const [availableSlots, setAvailableSlots] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      checkSlotsForDate(selectedDate);
    }
  }, [selectedDate]);

  const checkSlotsForDate = async (date) => {
    setLoading(true);
    try {
      // Format date without timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      const response = await queueAPI.getAvailableSlots(dateString);
      setAvailableSlots(response.data.data);
    } catch (error) {
      console.error('Error checking slots:', error);
      setAvailableSlots(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isPastDate = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            📅 Kalender Antrian
          </h1>
          <p className="text-gray-600 mt-2">Lihat ketersediaan slot antrian setiap hari</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Calendar Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <h2 className="text-xl font-semibold">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h2>
                  
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                {dayNames.map((day) => (
                  <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {days.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => date && setSelectedDate(date)}
                    disabled={!date || isPastDate(date)}
                    className={`aspect-square p-2 text-sm border-r border-b border-gray-100 transition-all duration-200 ${
                      !date
                        ? 'bg-gray-50'
                        : isPastDate(date)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isSelected(date)
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : isToday(date)
                        ? 'bg-indigo-100 text-indigo-700 font-semibold'
                        : 'hover:bg-blue-50 text-gray-700'
                    }`}
                  >
                    {date && (
                      <div className="flex flex-col items-center justify-center h-full">
                        <span>{date.getDate()}</span>
                        {isToday(date) && (
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1"></div>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Date Info */}
          <div className="space-y-4">
            {/* Date Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                📋 Informasi Hari Terpilih
              </h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Tanggal</p>
                  <p className="text-blue-800 font-semibold">{formatDate(selectedDate)}</p>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : availableSlots ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Slot Tersedia</p>
                        <p className="text-2xl font-bold text-green-700">{availableSlots.availableSlots}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 font-medium">Maksimal</p>
                        <p className="text-2xl font-bold text-gray-700">{availableSlots.maxSlots}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-indigo-50 rounded-lg">
                      <p className="text-sm text-indigo-600 font-medium">Jam Operasional</p>
                      <p className="text-indigo-800 font-semibold">
                        {availableSlots.operatingHours.start} - {availableSlots.operatingHours.end}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Utilisasi</span>
                        <span className="text-gray-800 font-medium">
                          {availableSlots.totalBooked > 0 ? Math.round((availableSlots.totalBooked / availableSlots.maxSlots) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${availableSlots.totalBooked > 0 ? (availableSlots.totalBooked / availableSlots.maxSlots) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-red-600 text-sm">❌ Tidak dapat memuat data slot</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">⚡ Aksi Cepat</h3>
              <div className="space-y-3">
                <button className="w-full p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors duration-200 text-sm font-medium">
                  👥 Lihat Daftar Antrian
                </button>
                <button className="w-full p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors duration-200 text-sm font-medium">
                  ➕ Tambah Antrian Manual
                </button>
                <button className="w-full p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors duration-200 text-sm font-medium">
                  📊 Export Laporan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQueueCalendar;