const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Patient who receives this notification'
  },
  type: {
    type: DataTypes.ENUM('emergency_closure', 'reschedule_request', 'reschedule_approved', 'reschedule_denied', 'queue_reminder'),
    allowNull: false,
    comment: 'Type of notification'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Notification title'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Notification message content'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether notification has been read'
  },
  actionRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether notification requires patient action'
  },
  actionData: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Data for required actions (e.g., reschedule options)'
  },
  relatedId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Related queue ID or emergency closure ID'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When this notification expires'
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['isRead']
    },
    {
      fields: ['type']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = Notification;