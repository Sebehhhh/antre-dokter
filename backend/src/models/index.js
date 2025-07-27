const sequelize = require('../config/database');
const User = require('./User');
const Queue = require('./Queue');
const PracticeSettings = require('./PracticeSettings');
const ActivityLog = require('./ActivityLog');

User.hasMany(Queue, { foreignKey: 'userId', as: 'queues' });
Queue.belongsTo(User, { foreignKey: 'userId', as: 'patient' });

User.hasMany(ActivityLog, { foreignKey: 'userId', as: 'activities' });
ActivityLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Queue.hasMany(ActivityLog, { foreignKey: 'queueId', as: 'activities' });
ActivityLog.belongsTo(Queue, { foreignKey: 'queueId', as: 'queue' });

const models = {
  User,
  Queue,
  PracticeSettings,
  ActivityLog,
  sequelize
};

module.exports = models;