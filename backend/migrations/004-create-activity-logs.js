'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('activity_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM(
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
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      queueId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'queues',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Additional data like queue number, patient name, etc.'
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
    await queryInterface.addIndex('activity_logs', ['type']);
    await queryInterface.addIndex('activity_logs', ['createdAt']);
    await queryInterface.addIndex('activity_logs', ['userId']);
    await queryInterface.addIndex('activity_logs', ['queueId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('activity_logs');
  }
};