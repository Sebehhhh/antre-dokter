import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { queueAPI } from '../utils/api';
import { getWitaDateString, addDaysToWitaDate } from '../utils/timezone';

const BookQueue = () => {
  const [formData, setFormData] = useState({
    appointmentDate: ''
  });
  const [availableSlots, setAvailableSlots] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  const today = getWitaDateString();
  const maxDateString = addDaysToWitaDate(30);

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
    } catch (error) {
      console.error('Error checking available slots:', error);
      setError('Gagal memeriksa slot yang tersedia');
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


  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Buat Antrian Baru</h1>
          <p className="text-gray-600 mt-2">Pilih tanggal kunjungan Anda - nomor antrian akan diberikan otomatis</p>
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
                  <span className="font-medium">Jam operasional:</span> {availableSlots.operatingHours?.start} - {availableSlots.operatingHours?.end}
                </p>
                <p className="text-blue-600 text-sm mt-1">
                  <span className="font-medium">Antrian berikutnya:</span> Nomor {availableSlots.totalBooked + 1}
                </p>
              </div>
            </div>
          )}

          {availableSlots && availableSlots.availableSlots === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <div className="text-red-500 text-4xl mb-3">😞</div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Slot Penuh</h3>
              <p className="text-red-600">
                Maaf, semua slot untuk tanggal tersebut sudah terisi. Silakan pilih tanggal lain.
              </p>
            </div>
          )}

          {availableSlots && availableSlots.availableSlots > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <div className="text-green-500 text-4xl mb-3">✅</div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">Siap Membuat Antrian</h3>
              <p className="text-green-600">
                Nomor antrian Anda akan menjadi: <span className="font-bold text-2xl">#{availableSlots.totalBooked + 1}</span>
              </p>
              <p className="text-green-600 text-sm mt-2">
                Silakan klik "Buat Antrian" untuk melanjutkan
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
              disabled={loading || !availableSlots || availableSlots.availableSlots === 0}
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