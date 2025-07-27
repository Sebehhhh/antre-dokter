import React from 'react';

const AdminReports = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          📊 Laporan
        </h1>
        <p className="text-gray-600 mt-2">Analisis dan laporan aktivitas praktik</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📊</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Fitur Laporan</h2>
        <p className="text-gray-600 mb-6">Halaman ini akan menampilkan grafik, statistik kunjungan, dan laporan keuangan.</p>
        <div className="text-sm text-gray-500">Coming Soon...</div>
      </div>
    </div>
  );
};

export default AdminReports;