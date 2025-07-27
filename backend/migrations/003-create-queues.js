'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('queues', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      queueNumber: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      appointmentDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('waiting', 'in_service', 'completed', 'cancelled', 'no_show'),
        allowNull: false,
        defaultValue: 'waiting'
      },
      estimatedServiceTime: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Estimated service time in minutes'
      },
      actualServiceTime: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Actual service time in minutes'
      },
      checkedInAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      serviceStartedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      serviceCompletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    // Create indexes
    await queryInterface.addIndex('queues', ['appointmentDate', 'queueNumber'], {
      unique: true,
      name: 'queues_date_number_unique'
    });
    await queryInterface.addIndex('queues', ['userId']);
    await queryInterface.addIndex('queues', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('queues');
  }
};