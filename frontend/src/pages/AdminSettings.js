import React, { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';

const AdminSettings = () => {
  const [formData, setFormData] = useState({
    doctorName: '',
    practiceName: '',
    practiceAddress: '',
    practicePhone: '',
    operatingDays: [],
    operatingHours: { start: '08:00', end: '17:00' },
    maxSlotsPerDay: 30,
    cancellationDeadline: 120
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const dayNames = [
    { value: 0, label: 'Minggu' },
    { value: 1, label: 'Senin' },
    { value: 2, label: 'Selasa' },
    { value: 3, label: 'Rabu' },
    { value: 4, label: 'Kamis' },
    { value: 5, label: 'Jumat' },
    { value: 6, label: 'Sabtu' }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminAPI.getSettings();
      const settings = response.data.data.settings;
      setFormData({
        doctorName: settings.doctorName || '',
        practiceName: settings.practiceName || '',
        practiceAddress: settings.practiceAddress || '',
        practicePhone: settings.practicePhone || '',
        operatingDays: settings.operatingDays || [],
        operatingHours: settings.operatingHours || { start: '08:00', end: '17:00' },
        maxSlotsPerDay: settings.maxSlotsPerDay || 30,
        cancellationDeadline: settings.cancellationDeadline || 120
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Gagal memuat pengaturan');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'operatingHours.start' || name === 'operatingHours.end') {
      const [field, subfield] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [subfield]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) : value
      }));
    }
  };

  const handleDayToggle = (dayValue) => {
    setFormData(prev => ({
      ...prev,
      operatingDays: prev.operatingDays.includes(dayValue)
        ? prev.operatingDays.filter(day => day !== dayValue)
        : [...prev.operatingDays, dayValue].sort()
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await adminAPI.updateSettings(formData);
      setSuccess('Pengaturan berhasil diperbarui');
    } catch (error) {
      console.error('Error updating settings:', error);
      setError(error.response?.data?.message || 'Gagal memperbarui pengaturan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Praktik</h1>
          <p className="text-gray-600 mt-2">Kelola informasi dan jadwal operasional praktik</p>
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
          {/* Informasi Praktik */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Informasi Praktik</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="doctorName" className="form-label">
                  Nama Dokter
                </label>
                <input
                  id="doctorName"
                  name="doctorName"
                  type="text"
                  required
                  className="form-input"
                  value={formData.doctorName}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="practiceName" className="form-label">
                  Nama Praktik
                </label>
                <input
                  id="practiceName"
                  name="practiceName"
                  type="text"
                  required
                  className="form-input"
                  value={formData.practiceName}
                  onChange={handleChange}
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="practiceAddress" className="form-label">
                  Alamat Praktik
                </label>
                <textarea
                  id="practiceAddress"
                  name="practiceAddress"
                  rows="3"
                  className="form-input"
                  value={formData.practiceAddress}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="practicePhone" className="form-label">
                  Telepon Praktik
                </label>
                <input
                  id="practicePhone"
                  name="practicePhone"
                  type="tel"
                  className="form-input"
                  value={formData.practicePhone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Hari Operasional */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Hari Operasional</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {dayNames.map(day => (
                <label key={day.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.operatingDays.includes(day.value)}
                    onChange={() => handleDayToggle(day.value)}
                    className="form-checkbox"
                  />
                  <span className="text-sm">{day.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Jam Operasional */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Jam Operasional</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="operatingHours.start" className="form-label">
                  Jam Buka
                </label>
                <input
                  id="operatingHours.start"
                  name="operatingHours.start"
                  type="time"
                  required
                  className="form-input"
                  value={formData.operatingHours.start}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="operatingHours.end" className="form-label">
                  Jam Tutup
                </label>
                <input
                  id="operatingHours.end"
                  name="operatingHours.end"
                  type="time"
                  required
                  className="form-input"
                  value={formData.operatingHours.end}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Pengaturan Antrian */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Pengaturan Antrian</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="maxSlotsPerDay" className="form-label">
                  Maksimal Antrian per Hari
                </label>
                <input
                  id="maxSlotsPerDay"
                  name="maxSlotsPerDay"
                  type="number"
                  min="1"
                  max="100"
                  required
                  className="form-input"
                  value={formData.maxSlotsPerDay}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="cancellationDeadline" className="form-label">
                  Batas Pembatalan (menit)
                </label>
                <input
                  id="cancellationDeadline"
                  name="cancellationDeadline"
                  type="number"
                  min="0"
                  required
                  className="form-input"
                  value={formData.cancellationDeadline}
                  onChange={handleChange}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimal berapa menit sebelum jadwal untuk bisa membatalkan
                </p>
              </div>
              
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;