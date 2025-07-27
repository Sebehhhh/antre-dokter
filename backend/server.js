const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const { sequelize } = require('./src/models');
const authRoutes = require('./src/routes/authRoutes');
const queueRoutes = require('./src/routes/queueRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const emergencyRoutes = require('./src/routes/emergencyRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));

// Rate limiting configuration
const isProduction = process.env.NODE_ENV === 'production';

// General rate limiter - more permissive for development
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 1000 : 10000, // Much higher limit in development
  message: {
    success: false,
    message: 'Terlalu banyak request. Coba lagi nanti.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !isProduction, // Skip rate limiting in development
});

// Auth-specific rate limiter - stricter for security
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 50 : 1000, // Higher limit in development
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !isProduction, // Skip auth rate limiting in development
});

if (isProduction) {
  app.use(generalLimiter);
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', isProduction ? authLimiter : (req, res, next) => next(), authRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'AntreDokter API is running',
    timestamp: new Date().toISOString()
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan'
  });
});

app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? error.message : 'Terjadi kesalahan pada server'
  });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.locals.io = io;

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    if (process.env.NODE_ENV === 'development') {
      // Use migration instead of sync for better control
      console.log('Database ready. Use migrations for schema changes.');
    }

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();