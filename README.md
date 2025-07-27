# AntreDokter - Sistema Antrian Dokter

Sistem manajemen antrian online untuk praktik dokter dengan antarmuka web untuk pasien, admin/resepsionis, dan dokter.

## Fitur Utama

### Modul Pasien
- Pendaftaran dan login akun pasien
- Pemesanan antrean online
- Melihat status antrean real-time
- Riwayat pemesanan
- Pembatalan antrean
- Notifikasi (WhatsApp/SMS - opsional)

### Modul Admin/Resepsionis
- Manajemen pasien
- Manajemen antrean
- Dashboard real-time
- Pengaturan praktik

### Modul Dokter
- Melihat daftar antrean harian
- Mengatur status pasien

## Struktur Proyek

```
AntreDokter/
├── frontend/          # React.js application
├── backend/           # Node.js/Express API
├── docs/             # Documentation
└── README.md
```

## Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Real-time**: Socket.io

## Setup Development

Lihat dokumentasi di folder `docs/` untuk panduan setup lengkap.