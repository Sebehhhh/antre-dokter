# Setup AntreDokter

## Prerequisites

- Node.js (v16 atau lebih baru)
- PostgreSQL (v12 atau lebih baru)
- npm atau yarn

## Database Setup

1. Install PostgreSQL dan buat database baru:
```sql
CREATE DATABASE antredokter_db;
CREATE USER antredokter_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE antredokter_db TO antredokter_user;
```

## Backend Setup

1. Masuk ke direktori backend:
```bash
cd backend
```

2. Copy file environment:
```bash
cp .env.example .env
```

3. Edit file `.env` dengan konfigurasi database Anda:
```
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=antredokter_db
DB_USER=antredokter_user
DB_PASSWORD=your_password

JWT_SECRET=your-very-secure-jwt-secret-key-here
JWT_EXPIRE=24h

CORS_ORIGIN=http://localhost:3000
```

4. Install dependencies:
```bash
npm install
```

5. Jalankan server development:
```bash
npm run dev
```

Server akan berjalan di http://localhost:5000

## Frontend Setup

1. Masuk ke direktori frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Buat file `.env` di direktori frontend:
```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Jalankan aplikasi development:
```bash
npm start
```

Aplikasi akan berjalan di http://localhost:3000

## Inisialisasi Data

Setelah server backend berjalan, database akan otomatis dibuat sesuai schema. Untuk menambahkan data awal:

1. Buat user admin pertama melalui registrasi
2. Update role user tersebut di database menjadi 'admin'
3. Buat practice settings melalui admin interface

## Testing

- Backend: `cd backend && npm test`
- Frontend: `cd frontend && npm test`

## Production Deployment

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

Deploy folder `build` ke web server atau hosting static file.

## Environment Variables (Production)

Pastikan set environment variables berikut untuk production:

```
NODE_ENV=production
DB_HOST=your-production-db-host
DB_NAME=your-production-db-name
DB_USER=your-production-db-user
DB_PASSWORD=your-production-db-password
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=https://your-domain.com
```