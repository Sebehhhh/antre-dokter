# AntreDokter - Sistem Antrian Dokter Online

Aplikasi web untuk mengelola antrian pasien dokter dengan fitur real-time notification dan laporan komprehensif. Sistem ini dirancang khusus untuk praktek dokter dengan dua tipe pengguna utama: **Admin** dan **Pasien**.

## Fitur Utama

### 🏥 Modul Pasien
- Pendaftaran dan login akun pasien
- Pemesanan antrian online dengan pemilihan tanggal dan slot waktu
- Melihat status antrian real-time
- Riwayat pemesanan lengkap
- Pembatalan antrian dengan notifikasi otomatis
- Notifikasi real-time untuk update status antrian
- Request reschedule antrian jika diperlukan

### 👨‍💼 Modul Admin
- **Manajemen Pasien**: Kelola data pasien, lihat riwayat kunjungan
- **Manajemen Antrian Real-time**: Monitor dan update status antrian (panggil, selesai, batal)
- **Dashboard Statistik**: Overview harian dengan grafik dan metrics
- **Laporan Komprehensif**: Report bulanan/periode dengan filter tanggal dan export
- **Pengaturan Praktik**: Konfigurasi jam operasional, slot waktu, dan quota harian
- **Emergency Closure**: Sistem penutupan darurat dengan notifikasi otomatis ke semua pasien
- **Kalender Antrian**: View kalender lengkap dengan management antrian
- **Notifikasi Management**: Kelola dan kirim notifikasi ke pasien
- **Reschedule Management**: Approve/reject request reschedule dari pasien

## Struktur Proyek

```
AntreDokter/
├── frontend/          # React.js application
├── backend/           # Node.js/Express API
├── docs/             # Documentation
└── README.md
```

## Tech Stack

### Backend
- **Node.js** + Express.js
- **PostgreSQL** + Sequelize ORM
- **JWT** Authentication
- **Socket.IO** untuk real-time updates
- **Helmet** + CORS untuk security

### Frontend
- **React.js** 19 + React Router
- **Tailwind CSS** untuk styling
- **Axios** untuk API calls
- **Socket.IO** client

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+

### Installation

1. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env dengan konfigurasi database

# Setup database (clean production-ready)
npm run db:setup  # Reset + migrate + seed (admin + practice settings only)

npm run dev       # Start development server
```

2. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env dengan API URL

npm start         # Start React development
```

3. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

### Default Admin Login
- **Phone**: 08123456789
- **Password**: Admin123!

## Production Deployment

```bash
# Backend Production Setup
cd backend
npm install --production
cp .env.example .env  # Configure with production values
npm run db:setup      # Clean setup: admin + practice settings only
npm start

# Frontend Production Build
cd frontend
npm install
cp .env.example .env  # Configure with production API URL
npm run build
# Serve build/ folder with web server (nginx/apache)
```

### Environment Variables

**Backend (.env):**
```
PORT=5001
NODE_ENV=production
DB_HOST=your-db-host
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password
JWT_SECRET=your-secure-jwt-secret
CORS_ORIGIN=https://your-frontend-domain.com
```

**Frontend (.env):**
```
REACT_APP_API_URL=https://your-api-domain.com/api
GENERATE_SOURCEMAP=false
```