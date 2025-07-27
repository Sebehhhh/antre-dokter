const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM(
      'queue_created', 
      'queue_called', 
      'queue_completed', 
      'queue_cancelled', 
      'queue_no_show',
      'user_registered',
      'user_login',
      'settings_updated'
    ),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  queueId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'queues',
      key: 'id'
    }
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional data like queue number, patient name, etc.'
  }
}, {
  tableName: 'activity_logs',
  timestamps: true,
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = ActivityLog;