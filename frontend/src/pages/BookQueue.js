import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { queueAPI } from '../utils/api';

const BookQueue = () => {
  const [formData, setFormData] = useState({
    appointmentDate: '',
    appointmentTime: ''
  });
  const [availableSlots, setAvailableSlots] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateString = maxDate.toISOString().split('T')[0];

  useEffect(() => {
    if (formData.appointmentDate) {
      checkAvailableSlots();
    }
  }, [formData.appointmentDate]);

  const checkAvailableSlots = async () => {
    try {
      const response = await queueAPI.getAvailableSlots(formData.appointmentDate);
      const data = response.data.data;
      setAvailableSlots(data);
      setTimeSlots(data.timeSlots || []);
      // Reset selected time when date changes
      setFormData(prev => ({ ...prev, appointmentTime: '' }));
    } catch (error) {
      console.error('Error checking available slots:', error);
      setError('Gagal memeriksa slot yang tersedia');
      setTimeSlots([]);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await queueAPI.bookQueue(formData);
      setSuccess('Antrian berhasil dibuat!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error booking queue:', error);
      setError(error.response?.data?.message || 'Gagal membuat antrian');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotSelect = (time) => {
    setFormData(prev => ({ ...prev, appointmentTime: time }));
    setError('');
  };

  const TimeSlotPicker = () => {
    if (timeSlots.length === 0) return null;

    return (
      <div className="space-y-4">
        <label className="form-label">Pilih Waktu Kunjungan</label>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-4 mb-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded"></div>
              <span className="text-gray-600">Tersedia</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded"></div>
              <span className="text-gray-600">Terisi</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Dipilih</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot.time}
                type="button"
                onClick={() => slot.isAvailable && handleTimeSlotSelect(slot.time)}
                disabled={!slot.isAvailable}
                className={`p-3 rounded-lg text-sm font-medium border-2 transition-all duration-200 ${
                  formData.appointmentTime === slot.time
                    ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                    : slot.isAvailable
                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300'
                    : 'bg-red-50 text-red-400 border-red-200 cursor-not-allowed'
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
          
          {formData.appointmentTime && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-700 text-sm font-medium">
                ✅ Waktu terpilih: {formData.appointmentTime}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Buat Antrian Baru</h1>
          <p className="text-gray-600 mt-2">Pilih tanggal dan waktu kunjungan Anda</p>
        </div>

        {error && (
          <div className="alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="appointmentDate" className="form-label">
              Tanggal Kunjungan
            </label>
            <input
              id="appointmentDate"
              name="appointmentDate"
              type="date"
              required
              min={today}
              max={maxDateString}
              className="form-input"
              value={formData.appointmentDate}
              onChange={handleChange}
            />
          </div>

          {availableSlots && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                <span className="mr-2">📊</span> Informasi Slot Hari Ini
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/50 p-3 rounded-lg">
                  <p className="text-gray-600">Slot Tersedia</p>
                  <p className="text-xl font-bold text-green-600">{availableSlots.availableSlots}</p>
                </div>
                <div className="bg-white/50 p-3 rounded-lg">
                  <p className="text-gray-600">Total Slot</p>
                  <p className="text-xl font-bold text-blue-600">{availableSlots.maxSlots}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-blue-700 text-sm">
                  <span className="font-medium">Jam operasional:</span> {availableSlots.operatingHours.start} - {availableSlots.operatingHours.end}
                </p>
              </div>
            </div>
          )}

          {availableSlots?.availableSlots > 0 ? (
            <TimeSlotPicker />
          ) : availableSlots && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <div className="text-red-500 text-4xl mb-3">😞</div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Slot Penuh</h3>
              <p className="text-red-600">
                Maaf, semua slot untuk tanggal tersebut sudah terisi. Silakan pilih tanggal lain.
              </p>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary flex-1"
            >
              Batal
            </button>
            
            <button
              type="submit"
              disabled={loading || !availableSlots || availableSlots.availableSlots === 0 || !formData.appointmentTime}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Buat Antrian'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookQueue;