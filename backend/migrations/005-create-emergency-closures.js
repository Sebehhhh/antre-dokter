const { Sequelize, DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('emergency_closures', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
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
        comment: 'ID of admin who created the emergency closure',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Whether this closure is still active'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('emergency_closures', ['closureDate']);
    await queryInterface.addIndex('emergency_closures', ['isActive']);
    await queryInterface.addIndex('emergency_closures', ['createdBy']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('emergency_closures');
  }
};