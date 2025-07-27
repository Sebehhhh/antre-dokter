const sequelize = require('../config/database');
const User = require('./User');
const Queue = require('./Queue');
const PracticeSettings = require('./PracticeSettings');
const ActivityLog = require('./ActivityLog');
const EmergencyClosure = require('./EmergencyClosure');
const Notification = require('./Notification');
const RescheduleRequest = require('./RescheduleRequest');

User.hasMany(Queue, { foreignKey: 'userId', as: 'queues' });
Queue.belongsTo(User, { foreignKey: 'userId', as: 'patient' });

User.hasMany(ActivityLog, { foreignKey: 'userId', as: 'activities' });
ActivityLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Queue.hasMany(ActivityLog, { foreignKey: 'queueId', as: 'activities' });
ActivityLog.belongsTo(Queue, { foreignKey: 'queueId', as: 'queue' });

User.hasMany(EmergencyClosure, { foreignKey: 'createdBy', as: 'emergencyClosures' });
EmergencyClosure.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(RescheduleRequest, { foreignKey: 'patientId', as: 'rescheduleRequests' });
RescheduleRequest.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });

User.hasMany(RescheduleRequest, { foreignKey: 'processedBy', as: 'processedReschedules' });
RescheduleRequest.belongsTo(User, { foreignKey: 'processedBy', as: 'processor' });

Queue.hasMany(RescheduleRequest, { foreignKey: 'originalQueueId', as: 'rescheduleRequests' });
RescheduleRequest.belongsTo(Queue, { foreignKey: 'originalQueueId', as: 'originalQueue' });

EmergencyClosure.hasMany(RescheduleRequest, { foreignKey: 'emergencyClosureId', as: 'rescheduleRequests' });
RescheduleRequest.belongsTo(EmergencyClosure, { foreignKey: 'emergencyClosureId', as: 'emergencyClosure' });

const models = {
  User,
  Queue,
  PracticeSettings,
  ActivityLog,
  EmergencyClosure,
  Notification,
  RescheduleRequest,
  sequelize
};

module.exports = models;