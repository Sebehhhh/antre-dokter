const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmergencyClosure = sequelize.define('EmergencyClosure', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  closureDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Date when practice is closed due to emergency'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Reason for emergency closure'
  },
  notificationSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether notification has been sent to affected patients'
  },
  affectedQueuesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of queues affected by this closure'
  },
  reschedulingOffered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether rescheduling has been offered to patients'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'ID of admin who created the emergency closure'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether this closure is still active'
  }
}, {
  tableName: 'emergency_closures',
  timestamps: true,
  indexes: [
    {
      fields: ['closureDate']
    },
    {
      fields: ['isActive']
    }
  ]
});

module.exports = EmergencyClosure;