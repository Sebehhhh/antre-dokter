'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('practice_settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      doctorName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      practiceName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      practiceAddress: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      practicePhone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      operatingDays: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [1, 2, 3, 4, 5, 6] // Mon-Sat
      },
      operatingHours: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: { start: '08:00', end: '17:00' }
      },
      maxSlotsPerDay: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 20
      },
      allowWalkIn: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      cancellationDeadline: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30,
        comment: 'Cancellation deadline in minutes'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('practice_settings');
  }
};