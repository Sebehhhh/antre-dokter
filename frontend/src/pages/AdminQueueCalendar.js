import React, { useState, useEffect } from 'react';
import { queueAPI, adminAPI, emergencyAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { getWitaTime } from '../utils/timezone';

const AdminQueueCalendar = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => {
    const witaTime = getWitaTime();
    return new Date(witaTime.getFullYear(), witaTime.getMonth(), witaTime.getDate());
  });
  const [availableSlots, setAvailableSlots] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const witaTime = getWitaTime();
    return new Date(witaTime.getFullYear(), witaTime.getMonth(), 1);
  });
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [searchPatient, setSearchPatient] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('');
  const [emergencyLoading, setEmergencyLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      checkSlotsForDate(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (showAddModal) {
      loadPatients();
    }
  }, [showAddModal]);

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

  const loadPatients = async () => {
    try {
      const response = await adminAPI.getAllPatients();
      setPatients(response.data.data.patients || []);
    } catch (error) {
      console.error('Error loading patients:', error);
      setPatients([]);
    }
  };

  const handleViewQueueList = () => {
    // Navigate to queue management with selected date
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    navigate(`/admin/queue-management?date=${dateString}`);
  };

  const handleAddManualQueue = () => {
    setShowAddModal(true);
    setSelectedPatient(null);
    setSearchPatient('');
    setMessage('');
  };

  const handleBookQueue = async () => {
    if (!selectedPatient) {
      setMessage('Pilih pasien terlebih dahulu');
      setMessageType('error');
      return;
    }

    setBookingLoading(true);
    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      const response = await queueAPI.bookQueueForPatient({
        appointmentDate: dateString,
        patientId: selectedPatient.id,
        notes: `Antrian dibuat manual oleh admin untuk ${selectedPatient.fullName}`
      });

      setMessage(`Antrian berhasil dibuat untuk ${selectedPatient.fullName} - Nomor Antrian: ${response.data.data.queueNumber}`);
      setMessageType('success');
      setShowAddModal(false);
      checkSlotsForDate(selectedDate); // Refresh slots
    } catch (error) {
      console.error('Error booking queue:', error);
      setMessage(error.response?.data?.message || 'Gagal membuat antrian');
      setMessageType('error');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleEmergencyClosure = async () => {
    if (!emergencyReason.trim()) {
      setMessage('Alasan penutupan darurat harus diisi');
      setMessageType('error');
      return;
    }

    setEmergencyLoading(true);
    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      const response = await emergencyAPI.createEmergencyClosure({
        closureDate: dateString,
        reason: emergencyReason
      });

      setMessage(`Penutupan darurat berhasil dibuat. ${response.data.data.emergencyClosure.affectedQueuesCount} antrian terpengaruh.`);
      setMessageType('success');
      setShowEmergencyModal(false);
      setEmergencyReason('');
      checkSlotsForDate(selectedDate); // Refresh slots
    } catch (error) {
      console.error('Error creating emergency closure:', error);
      setMessage(error.response?.data?.message || 'Gagal membuat penutupan darurat');
      setMessageType('error');
    } finally {
      setEmergencyLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => 
    patient.fullName?.toLowerCase().includes(searchPatient.toLowerCase()) ||
    patient.phoneNumber?.includes(searchPatient)
  );

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

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl ${
            messageType === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p className="font-medium">{message}</p>
          </div>
        )}

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
                  availableSlots.isEmergencyClosure ? (
                    /* Emergency closure information */
                    <div className="space-y-3">
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-red-600 text-lg">🚨</span>
                          <p className="text-red-800 font-semibold">Penutupan Darurat</p>
                        </div>
                        <p className="text-red-700 text-sm mb-3">{availableSlots.message}</p>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-white rounded-lg border border-red-100">
                            <p className="text-sm text-red-600 font-medium">Status</p>
                            <p className="text-red-800 font-semibold">Tutup Darurat</p>
                          </div>
                          <div className="p-3 bg-white rounded-lg border border-red-100">
                            <p className="text-sm text-red-600 font-medium">Antrian Terpengaruh</p>
                            <p className="text-red-800 font-semibold">{availableSlots.emergencyClosure.affectedQueuesCount}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">👤 Dibuat oleh</p>
                        <p className="text-blue-800 font-semibold">
                          {availableSlots.emergencyClosure.createdBy}
                        </p>
                      </div>

                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-600 font-medium">💡 Info</p>
                        <p className="text-yellow-800 text-sm">
                          Pasien yang terdaftar pada hari ini akan dihubungi untuk penjadwalan ulang
                        </p>
                      </div>
                    </div>
                  ) : availableSlots.isOperatingDay === false ? (
                    /* Non-operating day information */
                    <div className="space-y-3">
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-orange-600 text-lg">🚫</span>
                          <p className="text-orange-800 font-semibold">Hari Libur</p>
                        </div>
                        <p className="text-orange-700 text-sm mb-3">{availableSlots.message}</p>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-white rounded-lg border border-orange-100">
                            <p className="text-sm text-orange-600 font-medium">Status</p>
                            <p className="text-orange-800 font-semibold">Tutup</p>
                          </div>
                          <div className="p-3 bg-white rounded-lg border border-orange-100">
                            <p className="text-sm text-orange-600 font-medium">Slot Tersedia</p>
                            <p className="text-orange-800 font-semibold">0 / {availableSlots.maxSlots}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">📅 Hari Operasional</p>
                        <p className="text-blue-800 font-semibold">
                          {availableSlots.operatingDayNames?.join(', ') || 'Belum dikonfigurasi'}
                        </p>
                      </div>

                      {availableSlots.operatingHours && (
                        <div className="p-3 bg-indigo-50 rounded-lg">
                          <p className="text-sm text-indigo-600 font-medium">🕐 Jam Operasional</p>
                          <p className="text-indigo-800 font-semibold">
                            {availableSlots.operatingHours.start} - {availableSlots.operatingHours.end}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Operating day information */
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
                  )
                ) : (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-red-600 text-lg">❌</span>
                      <p className="text-red-800 font-semibold">Tidak dapat memuat data</p>
                    </div>
                    <p className="text-red-600 text-sm">Terjadi kesalahan saat memuat informasi slot</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">⚡ Aksi Cepat</h3>
              <div className="space-y-3">
                <button 
                  onClick={handleViewQueueList}
                  className="w-full p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  👥 Lihat Daftar Antrian
                </button>
                <button 
                  onClick={handleAddManualQueue}
                  disabled={availableSlots && (availableSlots.isOperatingDay === false || availableSlots.isEmergencyClosure)}
                  className={`w-full p-3 rounded-lg transition-colors duration-200 text-sm font-medium ${
                    availableSlots && (availableSlots.isOperatingDay === false || availableSlots.isEmergencyClosure)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                  }`}
                >
                  ➕ Tambah Antrian Manual
                </button>
                
                {/* Emergency Closure Button - only show for current/future operating days that aren't already closed */}
                {availableSlots && availableSlots.isOperatingDay && !availableSlots.isEmergencyClosure && (
                  <button 
                    onClick={() => setShowEmergencyModal(true)}
                    className="w-full p-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors duration-200 text-sm font-medium"
                  >
                    🚨 Tutup Darurat
                  </button>
                )}
                
                <button className="w-full p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors duration-200 text-sm font-medium">
                  📊 Export Laporan
                </button>
              </div>
            </div>
          </div>
        </div>
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
                <p className="text-blue-700">{formatDate(selectedDate)}</p>
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

              {/* Error Message */}
              {message && messageType === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-800">{message}</p>
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

      {/* Emergency Closure Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-red-800">🚨 Penutupan Darurat</h2>
                <button
                  onClick={() => {
                    setShowEmergencyModal(false);
                    setEmergencyReason('');
                  }}
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
              <div className="bg-red-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-2">📅 Tanggal Penutupan</h3>
                <p className="text-red-700">{formatDate(selectedDate)}</p>
              </div>

              {/* Warning Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <span className="text-yellow-600 text-lg">⚠️</span>
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-1">Peringatan</h4>
                    <p className="text-yellow-700 text-sm">
                      Tindakan ini akan membatalkan semua antrian yang sudah terdaftar untuk hari ini. 
                      Pasien akan dihubungi untuk penjadwalan ulang.
                    </p>
                  </div>
                </div>
              </div>

              {/* Reason Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💬 Alasan Penutupan Darurat <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={emergencyReason}
                  onChange={(e) => setEmergencyReason(e.target.value)}
                  placeholder="Contoh: Dokter sakit mendadak, keadaan darurat keluarga, dll."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex space-x-4">
              <button
                onClick={() => {
                  setShowEmergencyModal(false);
                  setEmergencyReason('');
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleEmergencyClosure}
                disabled={!emergencyReason.trim() || emergencyLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {emergencyLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                    Memproses...
                  </div>
                ) : (
                  '🚨 Tutup Praktik'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQueueCalendar;