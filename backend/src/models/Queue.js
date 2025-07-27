const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Queue = sequelize.define('Queue', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  queueNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  appointmentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('waiting', 'in_service', 'completed', 'cancelled', 'no_show', 'emergency_cancelled'),
    allowNull: false,
    defaultValue: 'waiting'
  },
  estimatedServiceTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Estimated service time in minutes'
  },
  actualServiceTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Actual service time in minutes'
  },
  checkedInAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  serviceStartedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  serviceCompletedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'queues',
  timestamps: true,
  indexes: [
    {
      fields: ['appointmentDate', 'queueNumber'],
      unique: true
    },
    {
      fields: ['userId']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Queue;