const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RescheduleRequest = sequelize.define('RescheduleRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  originalQueueId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Original queue that was cancelled'
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Patient requesting reschedule'
  },
  emergencyClosureId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Related emergency closure if applicable'
  },
  requestType: {
    type: DataTypes.ENUM('patient_request', 'admin_suggestion'),
    allowNull: false,
    comment: 'Who initiated the reschedule request'
  },
  originalDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Original appointment date'
  },
  preferredDates: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Patient preferred dates array'
  },
  suggestedDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Admin suggested date'
  },
  suggestedQueueNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Suggested queue position'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
    allowNull: false,
    defaultValue: 'pending',
    comment: 'Request status'
  },
  patientResponse: {
    type: DataTypes.ENUM('waiting', 'accepted', 'declined'),
    allowNull: false,
    defaultValue: 'waiting',
    comment: 'Patient response to suggestion'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reason for request or rejection'
  },
  processedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Admin who processed the request'
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When request was processed'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When patient response expires'
  }
}, {
  tableName: 'reschedule_requests',
  timestamps: true,
  indexes: [
    {
      fields: ['patientId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['patientResponse']
    },
    {
      fields: ['emergencyClosureId']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = RescheduleRequest;