# AntreDokter Flutter Setup Guide

## Prerequisites
1. Install Flutter SDK: https://flutter.dev/docs/get-started/install
2. Install Android Studio / VS Code dengan Flutter plugin
3. Setup Android/iOS emulator atau device fisik

## Setup Project
```bash
cd antredokter_mobile
flutter pub get
flutter run
```

## Backend Integration
Pastikan backend berjalan di `http://localhost:5000` atau update `ApiConstants.baseUrl`

## Features Implemented

### ✅ Completed
- Authentication (Login/Register)
- State Management dengan Provider
- API Integration
- Real-time Socket.IO
- Secure Storage
- Base UI Components

### 🔄 In Progress  
- Queue Booking Screen
- My Queues Screen
- Home Screen dengan current queue
- Notifications

### 📋 TODO
- Register Screen
- Queue Booking Form
- Queue Status Display
- Emergency Closure Handling
- Push Notifications
- Testing & Optimization

## Architecture
```
lib/
├── core/
│   ├── constants/     # API URLs, Colors, etc
│   ├── models/        # Data models
│   ├── services/      # API, Storage, Socket
│   └── utils/         # Utilities
├── features/
│   ├── auth/          # Authentication
│   ├── queue/         # Queue Management
│   └── notifications/ # Notifications
├── shared/
│   └── widgets/       # Reusable UI components
└── main.dart
```

## API Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/queue/available-slots` - Available time slots
- `POST /api/queue/book` - Book queue
- `GET /api/queue/my-queues` - User's queues
- `PATCH /api/queue/cancel/:id` - Cancel queue

## Real-time Events
- `queue-update` - Queue status changes
- `queue-call` - Patient called
- `emergency-closure` - Practice closure
- `notification` - New notifications