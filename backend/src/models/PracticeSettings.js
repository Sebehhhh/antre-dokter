const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PracticeSettings = sequelize.define('PracticeSettings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  doctorName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  practiceName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  practiceAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  practicePhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  operatingDays: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [1, 2, 3, 4, 5],
    comment: 'Array of operating days (0=Sunday, 1=Monday, etc.)'
  },
  operatingHours: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: { start: '08:00', end: '17:00' },
    comment: 'Operating hours in HH:MM format'
  },
  maxSlotsPerDay: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30,
    comment: 'Maximum number of appointment slots per day'
  },
  allowWalkIn: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  cancellationDeadline: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 120,
    comment: 'Minimum minutes before appointment for cancellation'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'practice_settings',
  timestamps: true
});

module.exports = PracticeSettings;